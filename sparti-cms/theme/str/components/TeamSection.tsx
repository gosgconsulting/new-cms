"use client";

import React from 'react';

const team = [
  {
    name: 'Head Coach',
    role: 'Physiotherapist',
    bio:
      'Experienced in rehabilitation and performance programming. Focused on sustainable results.',
    image: '/assets/team/member-1.png',
  },
  {
    name: 'Operations Lead',
    role: 'Business & Client Success',
    bio:
      'Streamlines onboarding and ensures support across services and compliance.',
    image: '/assets/team/member-2.jpeg',
  },
  {
    name: 'Strength Coach',
    role: 'Programming & Coaching',
    bio:
      'Delivers assessment-led sessions tailored to rehabilitation and performance.',
    image: '/assets/team/member-3.png',
  },
];

const TeamSection: React.FC = () => {
  return (
    <section id="team" className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-10 text-center">Our Team</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((m, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-24 h-24 rounded-full object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/theme/landingpage/assets/placeholder.svg';
                  }}
                />
                <div className="mt-3 font-semibold text-foreground">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.role}</div>
                <p className="mt-4 text-sm text-muted-foreground max-w-sm">{m.bio}</p>
                <div className="mt-6 h-px w-12 bg-border" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;