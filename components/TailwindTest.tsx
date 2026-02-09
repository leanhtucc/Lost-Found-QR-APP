/**
 * Tailwind Test Component
 * Component để kiểm tra Tailwind CSS config
 */

import React from 'react';

export const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold text-foreground">Tailwind CSS Test</h1>
        <p className="text-muted-foreground">
          Component này giúp kiểm tra các config Tailwind CSS đã được setup đúng chưa.
        </p>

        {/* Custom Utilities Test */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-foreground">Custom Utilities</h2>
          <div className="space-y-4">
            {/* card-elevated */}
            <div className="card-elevated p-4">
              <h3 className="font-semibold text-foreground mb-2">Card Elevated</h3>
              <p className="text-muted-foreground">Card với background, border và shadow</p>
            </div>

            {/* btn-gradient */}
            <button className="btn-gradient px-6 py-3 rounded-lg text-primary-foreground font-semibold">
              Button Gradient
            </button>

            {/* scrollbar-hide */}
            <div className="overflow-x-auto scrollbar-hide border border-border rounded-lg p-4">
              <div className="flex gap-4 w-[150%]">
                <div className="w-40 h-20 bg-primary rounded flex-shrink-0" />
                <div className="w-40 h-20 bg-success rounded flex-shrink-0" />
                <div className="w-40 h-20 bg-destructive rounded flex-shrink-0" />
                <div className="w-40 h-20 bg-secondary rounded flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">← Scroll ngang (scrollbar bị ẩn)</p>
            </div>
          </div>
        </section>

        {/* Color System Test */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-foreground">Color System</h2>

          {/* Background Colors */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Background Colors:</p>
            <div className="flex gap-2">
              <div className="w-20 h-20 bg-background border border-border rounded flex items-center justify-center">
                <span className="text-xs">bg</span>
              </div>
              <div className="w-20 h-20 bg-card border border-border rounded flex items-center justify-center">
                <span className="text-xs">card</span>
              </div>
              <div className="w-20 h-20 bg-secondary rounded flex items-center justify-center">
                <span className="text-xs">2nd</span>
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Status Colors:</p>
            <div className="flex gap-2">
              <div className="w-20 h-20 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-medium">
                Primary
              </div>
              <div className="w-20 h-20 bg-success rounded flex items-center justify-center text-success-foreground text-xs font-medium">
                Success
              </div>
              <div className="w-20 h-20 bg-destructive rounded flex items-center justify-center text-destructive-foreground text-xs font-medium">
                Error
              </div>
            </div>
          </div>

          {/* Text Colors */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Text Colors:</p>
            <div className="space-y-1">
              <p className="text-foreground">text-foreground - Main text</p>
              <p className="text-muted-foreground">text-muted-foreground - Muted text</p>
              <p className="text-primary">text-primary - Primary color</p>
              <p className="text-success">text-success - Success color</p>
              <p className="text-destructive">text-destructive - Error color</p>
            </div>
          </div>
        </section>

        {/* Ring & Border Test */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-foreground">Ring & Border</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-card border border-border rounded-lg hover:ring-2 ring-primary transition-all">
              Ring Primary
            </button>
            <button className="px-6 py-3 bg-card border border-border rounded-lg hover:ring-2 ring-success transition-all">
              Ring Success
            </button>
            <button className="px-6 py-3 bg-card border border-border rounded-lg hover:ring-2 ring-destructive transition-all">
              Ring Error
            </button>
          </div>
        </section>

        {/* Success Message */}
        <div className="card-elevated p-6 bg-success/10 border-success/20">
          <p className="text-success font-semibold text-center">
            ✅ Nếu bạn thấy tất cả các màu sắc và styles hiển thị đúng → Tailwind config đã hoạt
            động!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
