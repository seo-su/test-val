import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  FileText,
  ScrollText,
  ArrowRight,
  Sword,
  Shield,
  Map
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Browse Chapters',
    description: 'Explore the complete Curse of Strahd: Reloaded campaign content organized by acts and arcs.',
    link: '/chapters',
    color: 'text-blue-400',
  },
  {
    icon: Sparkles,
    title: 'Synthesize Content',
    description: 'Transform chapter content into organized, session-ready notes with NPCs, locations, and encounters.',
    link: '/synthesize',
    color: 'text-dm-gold',
  },
  {
    icon: FileText,
    title: 'Custom Templates',
    description: 'Upload your own note-taking templates or use our defaults to customize your session prep format.',
    link: '/templates',
    color: 'text-green-400',
  },
  {
    icon: ScrollText,
    title: 'Session Notes',
    description: 'Create, edit, and export session notes. Keep your campaign organized and ready to play.',
    link: '/sessions',
    color: 'text-dm-accent',
  },
];

const quickStats = [
  { icon: Sword, label: '4 Acts', sublabel: 'Full Campaign' },
  { icon: Shield, label: '50+ NPCs', sublabel: 'Detailed Characters' },
  { icon: Map, label: '100+ Locations', sublabel: 'Barovia Awaits' },
];

function HomePage() {
  return (
    <div className="max-w-6xl mx-auto fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-medieval text-dm-gold mb-4">
          Welcome, Game Master
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your ultimate companion for running Curse of Strahd: Reloaded.
          Prepare sessions, synthesize content, and manage your notes with ease.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="card p-6 text-center"
          >
            <stat.icon className="w-8 h-8 text-dm-gold mx-auto mb-3" />
            <div className="font-medieval text-xl text-white">{stat.label}</div>
            <div className="text-sm text-gray-400">{stat.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Link
            key={feature.link}
            to={feature.link}
            className="card-hover p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className={`${feature.color} p-3 rounded-lg bg-dm-dark/50`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medieval text-xl text-white mb-2 group-hover:text-dm-gold transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-dm-gold group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Getting Started */}
      <div className="card p-8">
        <h2 className="font-medieval text-2xl text-dm-gold mb-4">
          Getting Started
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-dm-accent flex items-center justify-center text-white font-bold shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Browse Content</h4>
              <p className="text-sm text-gray-400">
                Start by exploring the chapters and arcs of the campaign.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-dm-accent flex items-center justify-center text-white font-bold shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Synthesize</h4>
              <p className="text-sm text-gray-400">
                Select a chapter and generate session-ready notes automatically.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-dm-accent flex items-center justify-center text-white font-bold shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Run Your Session</h4>
              <p className="text-sm text-gray-400">
                Use your notes during play and export them for future reference.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Content from{' '}
          <a
            href="https://github.com/DragnaCarta/Curse-of-Strahd-Reloaded"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dm-gold hover:underline"
          >
            Curse of Strahd: Reloaded
          </a>
          {' '}by DragnaCarta
        </p>
      </div>
    </div>
  );
}

export default HomePage;
