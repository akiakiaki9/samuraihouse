import LinksContent from "@/components/LinksContent";
import { site } from "@/config/site";

export const metadata = {
  title: "SAMURAI HOUSE — контакты и ссылки | Бухара",
  description: "Официальная страница SAMURAI HOUSE в Бухаре: меню, Instagram, адрес, телефон, график работы и Wi-Fi.",
  openGraph: {
    title: "SAMURAI HOUSE — всё важное в одном месте",
    description: "Откройте меню, найдите ресторан, свяжитесь с нами и подключитесь к Wi-Fi.",
    type: "website",
  },
};

export default function LinksPage() {
  return <LinksContent site={site} />;
}
