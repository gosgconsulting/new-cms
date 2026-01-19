const Pagination = () => {
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button className="px-4 py-2 text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors border border-border-light hover:border-primary">
        Previous
      </button>
      <button className="px-4 py-2 text-sm font-body font-medium text-primary border border-primary">
        1
      </button>
      <button className="px-4 py-2 text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors border border-border-light hover:border-primary">
        2
      </button>
      <button className="px-4 py-2 text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors border border-border-light hover:border-primary">
        3
      </button>
      <button className="px-4 py-2 text-sm font-body font-light text-foreground/70 hover:text-primary transition-colors border border-border-light hover:border-primary">
        Next
      </button>
    </div>
  );
};

export default Pagination;
