
export const StatsSection = () => {
  // Hard-coded statistics data
  const statistics = [
    { _id: '1', label: 'Inception', value: 'Est. 2023', description: 'Company founded', category: 'company' },
    { _id: '2', label: 'Zambian Owned', value: '100%', description: 'Local ownership', category: 'company' },
    { _id: '3', label: 'Continental Routes', value: '8+', description: 'Routes across Africa', category: 'service' },
    { _id: '4', label: 'Partner Carriers', value: '15+', description: 'Trusted partners', category: 'achievement' }
  ];

  // Function to get color classes based on index
  const getColorClasses = (index: number) => {
    const colors = [
      {
        // Blue - primary color
        bg: 'from-primary/10 to-primary/5',
        border: 'border-primary/20',
        hoverBorder: 'hover:border-primary/50',
        text: 'text-primary',
        shadow: 'hover:shadow-primary/20'
      },
      {
        // Red - destructive color
        bg: 'from-destructive/10 to-destructive/5',
        border: 'border-destructive/20',
        hoverBorder: 'hover:border-destructive/50',
        text: 'text-destructive',
        shadow: 'hover:shadow-destructive/20'
      },
      {
        // Green - success color
        bg: 'from-success/10 to-success/5',
        border: 'border-success/20',
        hoverBorder: 'hover:border-success/50',
        text: 'text-success',
        shadow: 'hover:shadow-success/20'
      },
      {
        // Orange - warning color
        bg: 'from-warning/10 to-warning/5',
        border: 'border-warning/20',
        hoverBorder: 'hover:border-warning/50',
        text: 'text-warning',
        shadow: 'hover:shadow-warning/20'
      }
    ];
    
    return colors[index % colors.length];
  };

  return (
    <section className="py-20 border-y border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {statistics.map((stat, index) => {
          const colorClasses = getColorClasses(index);
          return (
            <div 
              key={stat._id} 
              className={`p-6 bg-linear-to-br ${colorClasses.bg} rounded-xl border ${colorClasses.border} ${colorClasses.hoverBorder} transition-all duration-300 group hover:shadow-lg ${colorClasses.shadow} hover:-translate-y-1`}
            >
              <div className={`text-4xl font-bold ${colorClasses.text} mb-2 group-hover:scale-110 transition-all duration-300`}>
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
