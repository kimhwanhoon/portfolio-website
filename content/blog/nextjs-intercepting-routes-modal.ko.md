---
title: "하나의 URL, 두 가지 경험: Next.js 인터셉팅 라우트로 새로고침에도 살아남는 모달 만들기"
slug: "nextjs-intercepting-routes-modal"
excerpt: "새로고침하거나 링크를 공유하면 사라지는 모달은 페이지가 아니라 함정입니다. Next.js의 병렬 라우트와 인터셉팅 라우트를 활용해, 포트폴리오 카드를 클릭하면 모달로 열리지만 직접 방문하면 실제로 공유 가능하고 SEO에 색인되는 독립 페이지로 해석되도록 만든 방법을 소개합니다 — UI 한 줄도 중복하지 않고 말이죠."
tags:
  - "Next.js"
  - "App Router"
  - "React"
  - "Frontend"
  - "UX"
---

제 포트폴리오에서 카드를 클릭하면 상세 화면이 중앙 모달로 떠오릅니다 — 뒤에는 그리드가 그대로 남아 있고, 스크롤 위치도 유지되며, `Esc`를 누르면 있던 자리로 정확히 돌아갑니다. 이제 그 URL을 복사해서 새 탭에 붙여넣어 보세요. *똑같은* 콘텐츠가 자체 `<title>`, Open Graph 카드, 구조화된 데이터를 갖춘 완전한 독립 페이지로 렌더링됩니다.

같은 URL인데, **어떻게 도달했느냐**에 따라 완전히 다른 두 가지 경험이 선택됩니다. 쿼리 스트링 꼼수도, 전역 `isModalOpen` 상태도, 클라이언트 측 데이터 재요청도 없습니다. 이것은 제가 가장 좋아하는 Next.js App Router 기능 중 하나이며, 두 가지 컨벤션이 함께 작동하면서 자연스럽게 나옵니다: **병렬 라우트(parallel routes)** 와 **인터셉팅 라우트(intercepting routes)** 입니다.

## "상태로서의 모달" 접근법의 문제

이걸 만드는 고전적인 방법은 스토어 어딘가에 불리언 값을 두는 것입니다:

```tsx
const [selected, setSelected] = useState<Item | null>(null);
// ...
<Card onClick={() => setSelected(item)} />
{selected && <Modal item={selected} onClose={() => setSelected(null)} />}
```

누군가 지극히 합리적인 행동을 하기 전까지는 잘 작동합니다:

- **모달이 열린 상태에서 페이지를 새로고침** → 모달이 사라지고 상태가 날아갑니다.
- **링크를 공유** → 받는 사람은 보여주고 싶었던 것이 아니라 그리드 화면에 도착합니다.
- **뒤로 가기를 누름** → 브라우저가 모달만 닫는 대신 페이지 전체를 떠납니다.
- **크롤러가 방문** → 색인할 URL이 없으므로, 상세 콘텐츠는 검색에 보이지 않습니다.

근본 문제: 모달이 주소를 가질 수 없다는 것입니다. 채용 담당자를 *바로 그 프로젝트*로 데려오는 것이 전부인 포트폴리오에서, 공유할 수 없는 상세 화면은 사소한 디테일이 아니라 버그입니다.

## 멘탈 모델: URL이 채워 넣는 슬롯

App Router는 **병렬 라우트**를 통해 레이아웃이 한 번에 두 개 이상의 "페이지"를 렌더링할 수 있게 합니다 — `@` 접두사가 붙은 폴더로 선언되는 이름 있는 슬롯입니다. 제 로케일 레이아웃에는 일반적인 `children` 외에 `modal` 슬롯이 있습니다:

```
app/[locale]/
├─ layout.tsx                 # {children} 와 {modal} 을 함께 렌더링
├─ @modal/
│  ├─ default.tsx             # 아무것도 매칭되지 않을 때 슬롯이 보여줄 것
│  └─ (.)portfolio/[slug]/
│     └─ page.tsx             # 인터셉트된 모달 뷰
└─ portfolio/
   └─ [slug]/
      └─ page.tsx             # 실제 독립 상세 페이지
```

레이아웃은 슬롯을 prop으로 받아 페이지 옆에 배치합니다:

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

두 가지가 화면을 공유합니다. `children`은 현재 있는 페이지(그리드)입니다. `modal`은 *대개 비어 있습니다* — 그리고 그 "대개"가 바로 핵심 트릭입니다.

### `default.tsx` 는 꺼짐 스위치

병렬 슬롯은 자신과 매칭되지 않는 라우트를 포함해 모든 라우트에 대해 *무언가*를 렌더링해야 합니다. 매칭도 없고 폴백도 없으면 해당 슬롯에 대해 404가 발생합니다. `@modal/default.tsx`가 바로 그 폴백이며, 모달의 경우 프로젝트에서 가장 단순한 파일입니다:

```tsx
export default function ModalDefault() {
  return null;
}
```

번역하자면: "URL이 포트폴리오 항목이 아닐 때, 모달 슬롯은 아무것도 렌더링하지 않는다." 그래서 홈 페이지에서는 슬롯이 비어 있고 그리드만 보입니다.

## 인터셉팅 라우트: 내비게이션이 떠나기 전에 가로채기

이제 마법의 폴더: `@modal/(.)portfolio/[slug]`. 이 `(.)` 접두사가 **인터셉팅 라우트**입니다. Next.js에게 이렇게 말합니다:

> 사용자가 *이 세그먼트 내부에서* `/portfolio/[slug]`로 이동할 때(소프트한 클라이언트 측 내비게이션 — 즉 `<Link>` 클릭), 실제 페이지를 로드하지 마라. 대신 **이것**을 매칭되는 슬롯에 렌더링하라.

`(.)`는 동일한 레벨을 매칭합니다. 트리를 거슬러 올라가기 위한 `(..)`, `(..)(..)`, `(...)` 변형도 있습니다. 제 것은 `portfolio/`와 같은 레벨에 있으므로 `(.)portfolio`가 올바른 매칭입니다.

그래서 카드 클릭은 — 그저 `<Link href="/{locale}/portfolio/{slug}">`일 뿐인데 — *인터셉트*됩니다. 그리드는 결코 언마운트되지 않습니다. 이전에 `default.tsx`를 통해 `null`을 렌더링하던 `@modal` 슬롯이 이제 인터셉트된 페이지로 해석되어 모달을 띄웁니다. 주소창의 URL은 실제 상세 경로로 업데이트됩니다. 브라우저 히스토리 관점에서는 진짜 내비게이션입니다 — 그리고 그것이 다음 부분을 작동하게 만드는 요소입니다.

**하드** 내비게이션 — URL 직접 입력, 새로고침, 공유된 링크 따라가기 — 은 인터셉트되지 *않습니다*. 가로챌 세그먼트가 없기 때문입니다. 그래서 Next.js는 실제 `portfolio/[slug]/page.tsx`를 제공합니다: 헤더, 푸터, 메타데이터, JSON-LD를 갖춘 완전한 페이지입니다.

## 보상: 모달 콘텐츠는 실제 서버 렌더링된 HTML

사람들이 놓치는 부분이 바로 여기입니다. 인터셉트된 모달 페이지도 여전히 **Server Component**입니다. 서버에서 자체적으로 데이터를 가져옵니다:

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

그리고 독립 페이지는 *완전히 동일한* `<PortfolioDetail>`을 렌더링합니다. 단지 페이지 크롬으로 감싸고 다이얼로그 대신 `generateMetadata`와 구조화된 데이터를 동반할 뿐입니다:

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
  // ...동일한 getPortfolioBySlug, 그다음:
  return (
    <main>
      <PortfolioDetail item={item} />
    </main>
  );
}
```

**`<PortfolioDetail>`이 단일 진실 공급원(single source of truth)입니다.** 갤러리, 설명, 기술 스택, 링크 — 한 번 작성되어 두 컨텍스트 모두에서 렌더링됩니다. 모달과 페이지는 결코 서로 어긋날 수 없습니다. 동기화할 대상 자체가 없기 때문입니다. 이 재사용이 바로 설계 목표이며, 인터셉팅 라우트는 컴포넌트를 오염시키는 `if (isModal)` 분기 없이 그것을 가능하게 해주는 수단일 뿐입니다.

## 모달 닫기 = 뒤로 가기

유일한 클라이언트 측 조각은 셸(shell)입니다. 모달을 여는 것이 히스토리 항목을 푸시했으므로, 닫는 것은 그저 `router.back()`입니다:

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

`router.back()`은 소프트 내비게이션이 만든 항목을 빼내고, URL은 그리드로 돌아가며, 슬롯은 `default.tsx` → `null`로 폴백되고, 모달은 언마운트됩니다. 배경 클릭, 닫기 버튼, `Esc`가 모두 `onOpenChange`를 거치므로 모든 닫기 경로가 일관되게 유지됩니다. 뒤에 있던 그리드가 한 번도 언마운트되지 않았기 때문에 스크롤 위치는 거저 보존됩니다.

## 제가 부딪힌 함정들

- **슬롯에는 페이지뿐 아니라 `default.tsx`가 필요합니다.** 이걸 빠뜨리면 관계없는 라우트들이 슬롯에 대해 404를 던집니다. `return null`이 답입니다.
- **인터셉트는 *소프트* 내비게이션만 가로챕니다.** 이것은 버그가 아니라 기능입니다 — 다만 URL을 입력해서는 모달을 테스트할 수 없다는 뜻입니다. 그리드에서 클릭해 들어가야 합니다. 열린 모달을 새로고침하면 *원래* 전체 페이지가 나오는 게 맞습니다.
- **메타데이터는 실제 페이지에 있고, 인터셉션에는 절대 두지 않습니다.** 크롤러와 링크 미리보기 생성기는 항상 하드 요청을 수행하므로, 완전한 `generateMetadata`를 가진 `portfolio/[slug]/page.tsx`를 받습니다. 모달은 자체 메타데이터가 필요 없고, 가져서도 안 됩니다.
- **양쪽의 데이터 페칭을 동일하게 유지하세요.** 둘 다 같은 `getPortfolioBySlug(slug, locale)`를 호출합니다. 동일한 캐시 동작, 동일한 `notFound()` 처리 — 진입점에 따라 달라지는 의외성이 없습니다.

## 그럴 만한 가치가 있는 이유

비용은 작은 파일 두 개와 `default.tsx` 하나입니다. 그 대가로 얻는 것: 일급(first-class)이고, 링크 가능하며, 새로고침에 강하고, 크롤링 가능한 URL로서의 모달 — 중복된 UI도, 관리할 모달 상태도 전혀 없이 말이죠. 손으로 직접 작성했어야 할 장부 관리를 브라우저의 히스토리 스택이 대신 해줍니다.

포트폴리오 사이트에서는 작은 부분입니다. 하지만 이것은 "모달을 만들었다"와 "모달을 *제대로* 만들 만큼 라우팅 모델을 이해했다"를 가르는 바로 그런 종류의 작은 차이입니다. 그게 제가 제 작업물에 적용하고 싶은 기준입니다.
