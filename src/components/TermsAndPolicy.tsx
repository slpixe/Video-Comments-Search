const Policy = () => {
  return (
    <div className="policyFooter">
      <a
        href={`${import.meta.env.BASE_URL}privacy.html`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ opacity: 0.5, fontSize: "0.75rem" }}
      >
        Privacy &amp; Terms
      </a>
    </div>
  );
};

export default Policy;
