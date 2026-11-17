import Hero from '@/components/Hero';
import AboutBlock from '@/components/AboutBlock';
import PopularDishes from '@/components/PopularDishes';
import MenuCategories from '@/components/MenuCategories';
import Advantages from '@/components/Advantages';
import AtmosphereGallery from '@/components/AtmosphereGallery';
import ContactBlock from '@/components/ContactBlock';
import MapEmbed from '@/components/MapEmbed';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/config/site';

export const metadata = buildMetadata({
  title: null, // главная = дефолтный title из layout
  description: site.description,
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutBlock />
      <PopularDishes />
      <MenuCategories />
      <Advantages />
      <AtmosphereGallery />
      <ContactBlock />
      <MapEmbed />
    </>
  );
}