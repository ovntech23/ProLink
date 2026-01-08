export const StatsSection = () => {
  return (
    <section className="py-20 border-y border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
          <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-all duration-300">
            Est. 2023
          </div>
          <div className="text-muted-foreground font-medium">Inception</div>
        </div>
        <div className="p-6 bg-linear-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 hover:border-accent/50 transition-all duration-300 group hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1">
          <div className="text-4xl font-bold text-accent mb-2 group-hover:scale-110 transition-all duration-300">
            100%
          </div>
          <div className="text-muted-foreground font-medium">Zambian Owned</div>
        </div>
        <div className="p-6 bg-linear-to-br from-success/10 to-success/5 rounded-xl border border-success/20 hover:border-success/50 transition-all duration-300 group hover:shadow-lg hover:shadow-success/20 hover:-translate-y-1">
          <div className="text-4xl font-bold text-success mb-2 group-hover:scale-110 transition-all duration-300">
            25+
          </div>
          <div className="text-muted-foreground font-medium">Global Routes</div>
        </div>
        <div className="p-6 bg-linear-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20 hover:border-warning/50 transition-all duration-300 group hover:shadow-lg hover:shadow-warning/20 hover:-translate-y-1">
          <div className="text-4xl font-bold text-warning mb-2 group-hover:scale-110 transition-all duration-300">
            15+
          </div>
          <div className="text-muted-foreground font-medium">Partner Carriers</div>
        </div>
      </div>
    </section>
  );
};