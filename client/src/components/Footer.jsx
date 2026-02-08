const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">© {new Date().getFullYear()} منصة حبيب جرجس - جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
};

export default Footer;
