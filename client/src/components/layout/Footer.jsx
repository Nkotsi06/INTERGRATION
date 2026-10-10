function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>© {currentYear} Lesotho Government System</p>
    </footer>
  );
}

export default Footer;