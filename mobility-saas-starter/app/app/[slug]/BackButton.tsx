"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const sameOriginReferrer = referrer?.origin === window.location.origin;

    if (sameOriginReferrer && referrer.pathname !== window.location.pathname) {
      router.back();
      return;
    }

    router.replace("/app");
  }

  return (
    <button className="btn btn-secondary" type="button" onClick={handleBack}>
      Return to Dashboard
    </button>
  );
}
