import { createFileRoute } from "@tanstack/react-router";
import MilkApp from "@/components/MilkApp";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "दूध डायरी - रोज़ का हिसाब" },
      { name: "description", content: "रोज़ाना दूध खरीद का हिसाब रखें, महीने भर का डेटा PDF/Excel में निकालें। पूरी तरह ऑफलाइन।" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <MilkApp />
      <Toaster position="top-center" richColors />
    </>
  );
}
