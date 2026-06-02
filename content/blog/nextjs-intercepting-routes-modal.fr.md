---
title: "Une seule URL, deux expériences : des modales qui survivent à un rafraîchissement grâce aux routes interceptrices de Next.js"
slug: "nextjs-intercepting-routes-modal"
excerpt: "Une modale qui disparaît quand on recharge la page ou qu'on partage son lien n'est pas une page — c'est un piège. Voici comment j'ai utilisé les routes parallèles et interceptrices de Next.js pour que les cartes de mon portfolio s'ouvrent dans une modale au clic, tout en se résolvant en une vraie page autonome, partageable et indexée par les moteurs de recherche lors d'une visite directe — sans dupliquer une seule ligne d'interface."
tags:
  - "Next.js"
  - "App Router"
  - "React"
  - "Frontend"
  - "UX"
---

Cliquez sur une carte de mon portfolio et une vue détaillée surgit dans une modale centrée — la grille reste derrière elle, votre position de défilement est intacte, et appuyer sur `Esc` vous ramène exactement là où vous étiez. Maintenant, copiez cette URL, collez-la dans un nouvel onglet, et vous obtenez le *même* contenu rendu comme une page autonome complète, avec son propre `<title>`, sa carte Open Graph et ses données structurées.

Même URL. Deux expériences totalement différentes, choisies en fonction de **la manière dont vous êtes arrivé**. Pas de bidouille avec des paramètres d'URL, pas d'état global `isModalOpen`, pas de nouvelle requête de données côté client. C'est l'une de mes fonctionnalités préférées de l'App Router de Next.js, et elle découle de deux conventions qui travaillent ensemble : les **routes parallèles** et les **routes interceptrices**.

## Le problème de l'approche « modale comme état »

La manière classique de construire ça, c'est un booléen quelque part dans un store :

```tsx
const [selected, setSelected] = useState<Item | null>(null);
// ...
<Card onClick={() => setSelected(item)} />
{selected && <Modal item={selected} onClose={() => setSelected(null)} />}
```

Ça marche jusqu'à ce que quelqu'un fasse quelque chose de tout à fait raisonnable :

- **Recharge la page** alors que la modale est ouverte → la modale disparaît, l'état est perdu.
- **Partage le lien** → le destinataire arrive sur la grille, pas sur ce que vous vouliez lui montrer.
- **Clique sur Précédent** → le navigateur quitte toute la page au lieu de simplement fermer la modale.
- **Un robot d'indexation visite le site** → il n'y a aucune URL à indexer, donc le contenu détaillé est invisible pour la recherche.

Le problème de fond : la modale n'est pas adressable. Pour un portfolio dont le rôle entier est d'amener un recruteur vers *ce projet précis*, une vue détaillée non partageable est un bug, pas un détail.

## Le modèle mental : un emplacement que l'URL vient remplir

L'App Router permet à un layout de rendre plusieurs « pages » à la fois grâce aux **routes parallèles** — des emplacements nommés, déclarés sous forme de dossiers préfixés par `@`. Mon layout de locale a les `children` habituels plus un emplacement `modal` :

```
app/[locale]/
├─ layout.tsx                 # rend {children} ET {modal}
├─ @modal/
│  ├─ default.tsx             # ce que l'emplacement affiche quand rien ne correspond
│  └─ (.)portfolio/[slug]/
│     └─ page.tsx             # la vue modale interceptée
└─ portfolio/
   └─ [slug]/
      └─ page.tsx             # la vraie page de détail autonome
```

Le layout reçoit l'emplacement comme une prop et le place à côté de la page :

```tsx
export default async function LocaleLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider>
      {children}
      {modal}
    </NextIntlClientProvider>
  );
}
```

Deux choses partagent l'écran. `children` est la page sur laquelle vous vous trouvez (la grille). `modal` est *généralement vide* — et ce « généralement » est toute l'astuce.

### `default.tsx` est l'interrupteur d'arrêt

Un emplacement parallèle doit rendre *quelque chose* pour chaque route, même les routes qui ne lui correspondent pas. S'il n'y a aucune correspondance et aucun repli, vous obtenez une 404 pour l'emplacement. `@modal/default.tsx` est ce repli, et pour une modale c'est le fichier le plus simple du projet :

```tsx
export default function ModalDefault() {
  return null;
}
```

Traduction : « Quand l'URL n'est pas un élément du portfolio, l'emplacement modale ne rend rien. » Ainsi, sur la page d'accueil, l'emplacement est vide et vous ne voyez que la grille.

## Routes interceptrices : capter la navigation avant qu'elle ne parte

Maintenant, le dossier magique : `@modal/(.)portfolio/[slug]`. Ce préfixe `(.)` est une **route interceptrice**. Il dit à Next.js :

> Quand l'utilisateur navigue vers `/portfolio/[slug]` *depuis l'intérieur de ce segment* (une navigation douce, côté client — c'est-à-dire en cliquant sur un `<Link>`), ne charge pas la vraie page. Rends **ceci** dans l'emplacement correspondant à la place.

Le `(.)` correspond au même niveau ; il existe aussi les variantes `(..)`, `(..)(..)` et `(...)` pour remonter dans l'arborescence. Le mien se situe au même niveau que `portfolio/`, donc `(.)portfolio` est la bonne correspondance.

Ainsi, un clic sur une carte — qui n'est qu'un `<Link href="/{locale}/portfolio/{slug}">` — est *intercepté*. La grille n'est jamais démontée. L'emplacement `@modal`, qui rendait auparavant `null` via `default.tsx`, se résout maintenant en la page interceptée et fait apparaître la modale. L'URL dans la barre d'adresse se met à jour vers le vrai chemin de détail. Pour l'historique du navigateur, c'est une vraie navigation — et c'est ce qui fait fonctionner la partie suivante.

Une navigation **brute** — taper l'URL, recharger, ou suivre un lien partagé — n'est *pas* interceptée. Il n'y a aucun segment depuis lequel intercepter. Next.js sert donc la vraie `portfolio/[slug]/page.tsx` : une page complète avec en-tête, pied de page, métadonnées et JSON-LD.

## Le bénéfice : le contenu de la modale est du vrai HTML rendu côté serveur

Voici la partie que les gens ratent. La page modale interceptée reste un **Server Component**. Elle récupère ses propres données sur le serveur :

```tsx
// app/[locale]/@modal/(.)portfolio/[slug]/page.tsx
export default async function PortfolioModal({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) notFound();

  return (
    <ModalShell>
      <PortfolioDetail item={item} />
    </ModalShell>
  );
}
```

Et la page autonome rend *exactement le même* `<PortfolioDetail>`, simplement enveloppé dans l'habillage de page et accompagné de `generateMetadata` et de données structurées plutôt que d'une boîte de dialogue :

```tsx
// app/[locale]/portfolio/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) return {};
  return {
    title: item.title,
    description: item.shortDescription,
    alternates: buildAlternates(locale, `/portfolio/${slug}`), // canonical + hreflang
    openGraph: { /* ... */ },
    twitter: { card: "summary_large_image", /* ... */ },
  };
}

export default async function PortfolioPage({ params }) {
  // ...le même getPortfolioBySlug, puis :
  return (
    <main>
      <PortfolioDetail item={item} />
    </main>
  );
}
```

**`<PortfolioDetail>` est la source unique de vérité.** Galerie, description, stack technique, liens — écrits une seule fois, rendus dans les deux contextes. La modale et la page ne peuvent jamais se désynchroniser, parce qu'il n'y a rien à synchroniser. Cette réutilisation est l'objectif de conception ; les routes interceptrices sont simplement ce qui la rend possible sans qu'une branche `if (isModal)` ne pollue le composant.

## Fermer la modale = revenir en arrière

La seule partie côté client, c'est le shell. Comme l'ouverture de la modale a empilé une entrée dans l'historique, la fermer revient simplement à appeler `router.back()` :

```tsx
"use client";

export function ModalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog.Root open onOpenChange={(open) => !open && router.back()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Close /* … */ />
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

`router.back()` retire l'entrée que la navigation douce avait créée, l'URL revient à la grille, l'emplacement retombe sur `default.tsx` → `null`, et la modale est démontée. Le clic sur l'arrière-plan, le bouton de fermeture et `Esc` passent tous par `onOpenChange`, donc chaque chemin de fermeture reste cohérent. La position de défilement est préservée gratuitement, parce que la grille derrière n'a jamais été démontée.

## Les pièges que j'ai rencontrés

- **Il vous faut `default.tsx` pour l'emplacement, pas seulement la page.** Oubliez-le et des routes sans rapport renvoient une 404 pour l'emplacement. `return null` est la réponse.
- **L'interception ne capte que les navigations *douces*.** C'est la fonctionnalité, pas un bug — mais cela signifie que vous ne pouvez pas tester la modale en tapant l'URL. Vous devez cliquer depuis la grille. Recharger une modale ouverte est *censé* vous donner la page complète.
- **Les métadonnées vivent sur la vraie page, jamais sur l'interception.** Les robots d'indexation et les générateurs d'aperçus de liens effectuent toujours des requêtes brutes, donc ils obtiennent `portfolio/[slug]/page.tsx` avec son `generateMetadata` complet. La modale n'a pas besoin (et ne devrait pas avoir) ses propres métadonnées.
- **Gardez la récupération de données identique des deux côtés.** Les deux appellent le même `getPortfolioBySlug(slug, locale)`. Même comportement de cache, même gestion de `notFound()` — pas de surprise selon le point d'entrée.

## Pourquoi ça en vaut la peine

Le coût, c'est deux petits fichiers et un `default.tsx`. Ce que vous récupérez : une modale qui est une URL de première classe, partageable, à l'épreuve des rafraîchissements et indexable, avec zéro interface dupliquée et zéro état de modale à gérer. La pile d'historique du navigateur fait la comptabilité que vous auriez sinon écrite à la main.

C'est une petite chose sur un site de portfolio. Mais c'est exactement le genre de petite chose qui sépare « j'ai fait une modale » de « j'ai compris le modèle de routage assez bien pour faire la modale *correctement* ». C'est le niveau d'exigence auquel je veux que mon propre travail soit tenu.
