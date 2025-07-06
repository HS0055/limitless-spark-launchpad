const CompanyLogos = () => {
  const companies = [
    { name: "Adobe", logo: "A" },
    { name: "Netflix", logo: "N" },
    { name: "Google", logo: "G" },
    { name: "Microsoft", logo: "M" },
    { name: "Sony", logo: "S" },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-center space-x-8 md:space-x-12 opacity-60">
        {companies.map((company, index) => (
          <div 
            key={index}
            className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted text-muted-foreground font-bold text-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {company.logo}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CompanyLogos;