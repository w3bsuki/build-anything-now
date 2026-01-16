/**
 * Card Comparison Demo Page
 * Compare the old InstagramCaseCard with the new TwitterCaseCard design
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstagramCaseCard } from '@/components/homepage/InstagramCaseCard';
import { TwitterCaseCard, TwitterCaseCardSkeleton } from '@/components/homepage/TwitterCaseCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AnimalCase } from '@/types';

// Sample case data for testing
const sampleCases: AnimalCase[] = [
  {
    id: 'case-demo-1',
    title: 'Намерено коте с наранена лапичка',
    description: 'Малко коте беше намерено до пътя с травма на предната лапа. Нуждае се от спешна ветеринарна помощ.',
    story: 'Котето беше открито от минувач, който забеляза, че не може да ходи правилно.',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
    ],
    status: 'urgent',
    species: 'cat',
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets',
    },
    fundraising: {
      current: 0,
      goal: 1200,
      currency: 'BGN',
    },
    updates: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'case-demo-2',
    title: 'Luna - Hit by car, needs surgery',
    description: 'Beautiful stray dog found injured after being hit by a car. Needs emergency surgery on both hind legs.',
    story: 'Luna was found by a kind passerby who noticed she couldn\'t walk properly.',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    status: 'critical',
    species: 'dog',
    location: {
      city: 'Plovdiv',
      neighborhood: 'Center',
    },
    fundraising: {
      current: 890,
      goal: 1500,
      currency: 'BGN',
    },
    updates: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'case-demo-3',
    title: 'Mila - Abandoned kitten with eye infection',
    description: 'Tiny kitten found abandoned in a cardboard box with severe eye infection that needs treatment.',
    story: 'Mila was found barely 4 weeks old, needing immediate medical attention.',
    images: [
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800',
    ],
    status: 'recovering',
    species: 'cat',
    location: {
      city: 'Varna',
      neighborhood: 'Sea Garden',
    },
    fundraising: {
      current: 320,
      goal: 400,
      currency: 'BGN',
    },
    updates: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'case-demo-4',
    title: 'Max - Senior dog fully funded!',
    description: 'Elderly stray with severe dental problems. Thanks to generous donors, treatment is fully funded!',
    story: 'Max is estimated to be around 12 years old. He was found with infected teeth causing constant pain.',
    images: [
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    ],
    status: 'adopted',
    species: 'dog',
    location: {
      city: 'Burgas',
      neighborhood: 'Center',
    },
    fundraising: {
      current: 600,
      goal: 600,
      currency: 'BGN',
    },
    updates: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CardComparisonDemo() {
  const { t } = useTranslation();
  const [showOld, setShowOld] = useState(true);
  const [showNew, setShowNew] = useState(true);
  const [sideBySide, setSideBySide] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="font-bold text-lg">Card Comparison Demo</h1>
        </div>
      </header>

      {/* Controls */}
      <div className="sticky top-14 z-40 bg-muted/50 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-old" 
                checked={showOld} 
                onCheckedChange={setShowOld} 
              />
              <Label htmlFor="show-old" className="text-sm font-medium">
                Old (Instagram Style)
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="show-new" 
                checked={showNew} 
                onCheckedChange={setShowNew} 
              />
              <Label htmlFor="show-new" className="text-sm font-medium">
                New (Twitter Style)
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={sideBySide ? "default" : "outline"}
                size="sm"
                onClick={() => setSideBySide(true)}
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Side by Side
              </Button>
              <Button
                variant={!sideBySide ? "default" : "outline"}
                size="sm"
                onClick={() => setSideBySide(false)}
              >
                <List className="w-4 h-4 mr-1" />
                Stacked
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Comparison */}
      <div className="container mx-auto px-4 py-6">
        {sideBySide ? (
          // Side by Side View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Old Cards Column */}
            {showOld && (
              <div className="space-y-4">
                <div className="sticky top-32 bg-background z-30 pb-2">
                  <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-destructive" />
                    Old Design (Instagram Style)
                  </h2>
                  <p className="text-sm text-muted-foreground">Current implementation with social buttons on top</p>
                </div>
                <div className="flex flex-col gap-4 max-w-md">
                  {sampleCases.map((caseData) => (
                    <InstagramCaseCard 
                      key={`old-${caseData.id}`} 
                      caseData={caseData} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* New Cards Column */}
            {showNew && (
              <div className="space-y-4">
                <div className="sticky top-32 bg-background z-30 pb-2">
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    New Design (Twitter Style)
                  </h2>
                  <p className="text-sm text-muted-foreground">Clean card-based design with better hierarchy</p>
                </div>
                <div className="flex flex-col gap-4 max-w-md">
                  {sampleCases.map((caseData) => (
                    <TwitterCaseCard 
                      key={`new-${caseData.id}`} 
                      caseData={caseData} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Stacked View - Compare same case side by side
          <div className="space-y-12 max-w-4xl mx-auto">
            {sampleCases.map((caseData) => (
              <div key={caseData.id} className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-border pb-2">
                  {caseData.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showOld && (
                    <div>
                      <span className="text-xs font-medium text-destructive mb-2 block">OLD</span>
                      <InstagramCaseCard caseData={caseData} />
                    </div>
                  )}
                  {showNew && (
                    <div>
                      <span className="text-xs font-medium text-primary mb-2 block">NEW</span>
                      <TwitterCaseCard caseData={caseData} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State Demo */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-bold mb-4">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">New Card Skeleton</span>
              <TwitterCaseCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
