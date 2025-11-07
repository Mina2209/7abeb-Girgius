const Footer = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white/70">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p className="text-sm">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
};

export default Footer;
