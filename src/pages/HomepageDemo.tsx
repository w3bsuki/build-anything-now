import { useState } from 'react';
import { Search, Bell, User, Plus, Heart, MessageCircle, Share2, MoreHorizontal, ChevronDown, MapPin, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock data for heroes/stories
const mockStories = [
  { id: 'welcome', type: 'system', name: 'Welcome', image: '🎉', isNew: true },
  { id: 'how', type: 'system', name: 'How it works', image: '📖', isNew: true },
  { id: 1, type: 'case', name: 'Luna', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150', isNew: true },
  { id: 2, type: 'helper', name: 'Maria', image: 'https://i.pravatar.cc/150?img=1', count: 12 },
  { id: 3, type: 'case', name: 'Max', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150', isNew: false },
  { id: 4, type: 'helper', name: 'Tom', image: 'https://i.pravatar.cc/150?img=2', count: 9 },
  { id: 5, type: 'helper', name: 'Eva', image: 'https://i.pravatar.cc/150?img=3', count: 7 },
  { id: 6, type: 'case', name: 'Buddy', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150', isNew: true },
];

const filters = [
  { id: 'all', label: 'All', short: 'All' },
  { id: 'critical', label: 'Critical', short: '🔴', color: 'text-red-500' },
  { id: 'urgent', label: 'Urgent', short: '🟠', color: 'text-orange-500' },
  { id: 'recovering', label: 'Recovering', short: '💚', color: 'text-green-500' },
  { id: 'adopted', label: 'Adopted', short: '✨', color: 'text-yellow-500' },
];

// ============================================================
// SHARED COMPONENTS
// ============================================================

function StoryCircle({ story, size = 64 }: { story: typeof mockStories[0]; size?: number }) {
  const isSystem = story.type === 'system';
  const isEmoji = typeof story.image === 'string' && story.image.length <= 2;
  
  return (
    <button className="flex flex-col items-center gap-1 flex-shrink-0">
      {/* Gradient Ring */}
      <div
        className={cn(
          "rounded-full p-[2px]",
          story.isNew 
            ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500" 
            : "bg-muted"
        )}
        style={{ width: size + 4, height: size + 4 }}
      >
        <div className="rounded-full bg-background p-[2px] w-full h-full">
          {isEmoji ? (
            <div 
              className="rounded-full bg-muted flex items-center justify-center w-full h-full text-2xl"
              style={{ width: size - 4, height: size - 4 }}
            >
              {story.image}
            </div>
          ) : (
            <img
              src={story.image}
              alt={story.name}
              className="rounded-full object-cover w-full h-full"
              style={{ width: size - 4, height: size - 4 }}
            />
          )}
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-[60px]">
        {story.name}
      </span>
      {story.type === 'helper' && story.count && (
        <span className="text-[10px] font-semibold text-primary">🏆 {story.count}</span>
      )}
    </button>
  );
}

function AddCaseCircle({ size = 64 }: { size?: number }) {
  return (
    <button className="flex flex-col items-center gap-1 flex-shrink-0">
      <div
        className="rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors"
        style={{ width: size, height: size }}
      >
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <span className="text-[11px] text-muted-foreground">Report</span>
    </button>
  );
}

function StoryCircles({ size = 56 }: { size?: number }) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-4 py-3" style={{ width: 'max-content' }}>
        <AddCaseCircle size={size} />
        {mockStories.map((story) => (
          <StoryCircle key={story.id} story={story} size={size} />
        ))}
      </div>
    </div>
  );
}

function CaseCard({ variant = 'default' }: { variant?: 'default' | 'instagram' }) {
  if (variant === 'instagram') {
    return (
      <div className="bg-card border-b border-border">
        {/* User Header */}
        <div className="flex items-center gap-3 p-3">
          <img src="https://i.pravatar.cc/150?img=10" alt="User" className="w-9 h-9 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">@w3bsuki</span>
              <span className="text-muted-foreground text-xs">• 2h</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="w-3 h-3" />
              <span>Sofia, Mladost</span>
            </div>
          </div>
          <button className="p-1"><MoreHorizontal className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        {/* Image */}
        <div className="relative aspect-[4/5] bg-muted">
          <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600" alt="Cat" className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 space-y-2.5">
          <div className="flex items-center gap-4">
            <button className="hover:scale-110 transition-transform"><Heart className="w-6 h-6" /></button>
            <button className="hover:scale-110 transition-transform"><MessageCircle className="w-6 h-6" /></button>
            <button className="hover:scale-110 transition-transform"><Share2 className="w-6 h-6" /></button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/32?img=1" className="w-6 h-6 rounded-full border-2 border-background" />
              <img src="https://i.pravatar.cc/32?img=2" className="w-6 h-6 rounded-full border-2 border-background" />
              <img src="https://i.pravatar.cc/32?img=3" className="w-6 h-6 rounded-full border-2 border-background" />
            </div>
            <span className="text-sm"><strong>24 people</strong> are helping</span>
          </div>

          <p className="text-sm">
            <strong>@w3bsuki</strong>{' '}
            Found this injured cat near the park. She needs surgery urgently...{' '}
            <span className="text-muted-foreground">more</span>
          </p>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full" style={{ width: '24%' }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span><strong className="text-foreground">€120</strong> raised</span>
              <span>€500 goal</span>
            </div>
          </div>

          <Button className="w-full" size="sm">
            🤝 Join 24 helpers
          </Button>
        </div>
      </div>
    );
  }

  // Default compact card
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="relative aspect-[16/10] bg-muted">
        <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" alt="Cat" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">CRITICAL</span>
        </div>
        <div className="absolute top-2 right-2">
          <button className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1">Injured cat needs surgery</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>Sofia, Lozenets</span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '24%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>€120 / €500</span>
            <span>24 helpers</span>
          </div>
        </div>
        <Button size="sm" className="w-full text-xs h-8">❤️ Help Luna</Button>
      </div>
    </div>
  );
}

// ============================================================
// LAYOUT VARIATIONS
// ============================================================

function LayoutSegmentedCompact() {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="border-2 border-dashed border-violet-500 rounded-xl overflow-hidden">
      <div className="bg-violet-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 1: Segmented Control (Icons Only)
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><User className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles */}
      <div className="border-b bg-card/50">
        <StoryCircles size={52} />
      </div>

      {/* Segmented Control - Icons only */}
      <div className="px-4 py-2 border-b bg-card/50">
        <div className="flex bg-muted rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-sm font-medium transition-colors",
                filter === f.id 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.id === 'all' ? 'All' : f.short}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <CaseCard />
          <CaseCard />
        </div>
      </div>
    </div>
  );
}

function LayoutSegmentedLabels() {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="border-2 border-dashed border-blue-500 rounded-xl overflow-hidden">
      <div className="bg-blue-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 2: Segmented Control (Labels)
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles */}
      <div className="border-b bg-card/50">
        <StoryCircles size={52} />
      </div>

      {/* Segmented Control - With labels */}
      <div className="px-4 py-2 border-b bg-card/50">
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {filters.slice(0, 4).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                filter === f.id 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.id !== 'all' && <span className="mr-1">{f.short}</span>}
              {f.label}
            </button>
          ))}
          <button className="px-2 py-1.5 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <CaseCard />
          <CaseCard />
        </div>
      </div>
    </div>
  );
}

function LayoutDropdownFilter() {
  const [filter, setFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  return (
    <div className="border-2 border-dashed border-emerald-500 rounded-xl overflow-hidden">
      <div className="bg-emerald-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 3: Dropdown Filter in Header
      </div>
      
      {/* Header with Dropdown */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-sm font-medium"
          >
            {filter === 'all' ? 'All Cases' : filters.find(f => f.id === filter)?.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setDropdownOpen(false); }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2",
                    filter === f.id && "bg-muted"
                  )}
                >
                  {f.id !== 'all' && <span>{f.short}</span>}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles - Full width, no competition */}
      <div className="border-b bg-card/50">
        <StoryCircles size={56} />
      </div>

      {/* Feed - Starts immediately */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <CaseCard />
          <CaseCard />
        </div>
      </div>
    </div>
  );
}

function LayoutTabsUnderline() {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="border-2 border-dashed border-orange-500 rounded-xl overflow-hidden">
      <div className="bg-orange-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 4: Underline Tabs (Twitter/X Style)
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles */}
      <div className="border-b bg-card/50">
        <StoryCircles size={52} />
      </div>

      {/* Underline Tabs */}
      <div className="flex border-b bg-card/50">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium relative transition-colors",
              filter === f.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {f.id !== 'all' && <span className="mr-1">{f.short}</span>}
            {f.id === 'all' ? 'All' : ''}
            {filter === f.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <CaseCard />
          <CaseCard />
        </div>
      </div>
    </div>
  );
}

function LayoutInstagramFeed() {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="border-2 border-dashed border-pink-500 rounded-xl overflow-hidden">
      <div className="bg-pink-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 5: Instagram Feed (Full Posts)
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles */}
      <div className="border-b bg-card/50">
        <StoryCircles size={56} />
      </div>

      {/* Minimal filter - just icons */}
      <div className="flex justify-center gap-6 py-2 border-b bg-card/50">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "text-lg transition-transform",
              filter === f.id ? "scale-125" : "opacity-50 hover:opacity-100"
            )}
          >
            {f.id === 'all' ? '🌐' : f.short}
          </button>
        ))}
      </div>

      {/* Instagram-style Feed */}
      <div className="max-h-[450px] overflow-y-auto">
        <CaseCard variant="instagram" />
      </div>
    </div>
  );
}

function LayoutNoFilters() {
  return (
    <div className="border-2 border-dashed border-cyan-500 rounded-xl overflow-hidden">
      <div className="bg-cyan-500 text-white text-center py-1 text-xs font-bold">
        LAYOUT 6: No Filters (Algorithm Decides)
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <span className="font-bold">Pawtreon</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Bell className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Story Circles - Hero element */}
      <div className="border-b bg-card/50">
        <StoryCircles size={60} />
      </div>

      {/* Feed starts immediately - smart sorting */}
      <div className="max-h-[450px] overflow-y-auto">
        <CaseCard variant="instagram" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN DEMO PAGE
// ============================================================

export default function HomepageDemo() {
  return (
    <div className="min-h-screen bg-muted/30 pb-24 pt-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">🏠 Homepage Layout Lab</h1>
          <p className="text-muted-foreground text-sm">
            Circles + Filter variations. Pick your favorite!
          </p>
        </div>

        {/* Grid of layouts */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <LayoutSegmentedCompact />
          <LayoutSegmentedLabels />
          <LayoutDropdownFilter />
          <LayoutTabsUnderline />
          <LayoutInstagramFeed />
          <LayoutNoFilters />
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-card rounded-xl border space-y-3">
          <h2 className="font-bold">📊 Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Layout</th>
                  <th className="text-left py-2">Circles</th>
                  <th className="text-left py-2">Filters</th>
                  <th className="text-left py-2">Feed</th>
                  <th className="text-left py-2">Best For</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">1. Segmented Icons</td>
                  <td>✅</td>
                  <td>Compact icons</td>
                  <td>Grid</td>
                  <td>Mobile efficiency</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">2. Segmented Labels</td>
                  <td>✅</td>
                  <td>Labels + overflow</td>
                  <td>Grid</td>
                  <td>Clarity</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">3. Dropdown</td>
                  <td>✅ Full spotlight</td>
                  <td>In header</td>
                  <td>Grid</td>
                  <td>Circles-first</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">4. Underline Tabs</td>
                  <td>✅</td>
                  <td>Twitter-style</td>
                  <td>Grid</td>
                  <td>Familiar pattern</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">5. Instagram Feed</td>
                  <td>✅</td>
                  <td>Minimal icons</td>
                  <td>Full posts</td>
                  <td>Engagement</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">6. No Filters</td>
                  <td>✅ Hero</td>
                  <td>None (smart sort)</td>
                  <td>Full posts</td>
                  <td>Simplicity</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <h3 className="font-bold text-primary mb-2">💡 My Picks</h3>
          <ul className="text-sm space-y-1">
            <li><strong>For MVP:</strong> Layout 3 (Dropdown) - Circles get full attention</li>
            <li><strong>For engagement:</strong> Layout 5 (Instagram) - Social feel</li>
            <li><strong>For power users:</strong> Layout 1 (Segmented Icons) - Quick filtering</li>
          </ul>
        </div>
        
        {/* Cleanup note */}
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ Demo page. Delete after deciding: <code>src/pages/HomepageDemo.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
