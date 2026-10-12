const Policy = () => {
  return (
    <footer className="policyFooter pageWidth">
      <a
        href={`${import.meta.env.BASE_URL}privacy.html`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy &amp; Terms
      </a>
    </footer>
  );
};

export default Policy;
