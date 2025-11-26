// frontend/components/layout/Footer.tsx
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("common");

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p>&copy; 2024 Amazon Clone. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
