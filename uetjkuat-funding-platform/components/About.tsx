import React from 'react';
import { Calendar, Book, Building, Heart, Users, GraduationCap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-secondary/10 text-foreground relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Chairperson Section */}
        <div className="mb-20 bg-card backdrop-blur-md rounded-3xl border border-border p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary shadow-sm">
                <img
                  src="https://i.pravatar.cc/300?u=boniface"
                  alt="Boniface Mwanzia David - Chairperson UET JKUAT"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
                Chairperson 2025/2026
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
                Boniface Mwanzia David
              </h2>
              <p className="text-xl text-muted-foreground font-medium mb-6">
                Bachelor of Science in Banking and Finance
              </p>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I am Bonface Mwanzia David, currently serving as the Chairperson of the Uttermost Evangelistic Team (UET), JKUAT Chapter. Having served as Treasurer previously, I have seen God's faithfulness in this ministry.
                </p>
                <p>
                  My mission is to lead this team into a profound knowledge of Jesus Christ. We are raising a generation of students rooted in the Word, bold in evangelism, and unwavering in faith.
                </p>
                <blockquote className="border-l-4 border-primary pl-4 italic text-foreground my-6">
                  "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be glory both now and forever! Amen." — 2 Peter 3:18
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* About UET JKUAT Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">About UET JKUAT</h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors group shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                At UET JKUAT, we live out our faith actively. Every gathering, prayer meeting, and outreach is an opportunity to glorify God and reach others with the transforming Gospel of Jesus Christ.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors group shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Commitment</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to nurturing young believers. Here, you'll find a strong foundation in the Word, opportunities to serve, and a spiritual family that journeys with you.
              </p>
            </div>
          </div>
        </div>

        {/* Activities Schedule */}
        <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Weekly Activities</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sunday Fellowship */}
            <div className="bg-secondary/20 p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Sunday Fellowship</h3>
                  <p className="text-primary text-sm font-bold mb-3">Every Sunday | 3:30 PM – 5:30 PM</p>
                  <p className="text-muted-foreground text-sm">
                    The heartbeat of UET JKUAT. A time of worship, teaching, and testimonies.
                  </p>
                </div>
              </div>
            </div>

            {/* Wednesday Prayer */}
            <div className="bg-secondary/20 p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Book className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Leaders' Prayer</h3>
                  <p className="text-primary text-sm font-bold mb-3">Wednesday</p>
                  <p className="text-muted-foreground text-sm">
                    Executive and ministry leaders interceding for the team and the university.
                  </p>
                </div>
              </div>
            </div>

            {/* Thursday Activities */}
            <div className="bg-secondary/20 p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Prayer & Family</h3>
                  <p className="text-primary text-sm font-bold mb-3">Thursday | 7:00 PM</p>
                  <p className="text-muted-foreground text-sm">
                    Day of fasting followed by intimate small group fellowships in the evening.
                  </p>
                </div>
              </div>
            </div>

            {/* Tuesday Evangelism */}
            <div className="bg-secondary/20 p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Building className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Evangelism</h3>
                  <p className="text-primary text-sm font-bold mb-3">Tuesday | 5:00 PM</p>
                  <p className="text-muted-foreground text-sm">
                    Sharing the Good News in Juja and surrounding areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Book, label: "Word Foundation", color: "text-blue-500" },
            { icon: Heart, label: "Service", color: "text-green-500" },
            { icon: Users, label: "Fellowship", color: "text-purple-500" },
            { icon: Building, label: "Evangelism", color: "text-red-500" },
            { icon: Users, label: "Family", color: "text-yellow-500" },
            { icon: GraduationCap, label: "Mentorship", color: "text-indigo-500" },
          ].map((item, index) => (
            <div key={index} className="bg-card p-4 rounded-xl text-center border border-border hover:border-primary/50 transition-colors shadow-sm">
              <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
