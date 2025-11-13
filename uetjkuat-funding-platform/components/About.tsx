
import React from 'react';
import { IconCalendar, IconBook, IconBuilding, IconHeartHand } from './icons';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Chairperson Section */}
        <div className="mb-16 bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-blue-600 shadow-xl">
                <img 
                  src="https://i.pravatar.cc/300?u=boniface" 
                  alt="Boniface Mwanzia David - Chairperson UET JKUAT" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-2">
                Boniface Mwanzia David
              </h2>
              <p className="text-xl text-blue-600 font-semibold mb-4">
                Chairperson – UET JKUAT (2025/2026)
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                I am Bonface Mwanzia David, a final-year student pursuing a Bachelor of Science in Banking and Finance. By the grace of God, I currently serve as the Chairperson of the Uttermost Evangelistic Team (UET), JKUAT Chapter, for the 2025/2026 spiritual year. In the previous year, I had the honor of serving as Treasurer (2024/2025)—a role that strengthened my leadership, deepened my walk with Christ, and prepared me for greater responsibilities in ministry.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                My journey at UET has been transformative. It has shaped not only my spiritual growth but also my character, discipline, and vision. Through moments of prayer, outreach, fellowships, and mentorship, I have encountered God's presence and purpose more intimately. UET has been more than a ministry to me—it has been a spiritual home.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                My core mission as Chairperson is to lead this team into a more profound knowledge of Jesus Christ, ensuring every member understands the Gospel intellectually and personally experiences its life-changing power. I desire to raise a generation of students who are rooted in the Word, bold in their evangelism, and unwavering in their faith—disciples who will stand firm and influence their spheres beyond campus.
              </p>
              <p className="text-gray-600 italic leading-relaxed">
                "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be glory both now and forever! Amen." — 2 Peter 3:18
              </p>
            </div>
          </div>
        </div>

        {/* About UET JKUAT Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">About UET JKUAT</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <IconHeartHand className="w-6 h-6 text-blue-600" />
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                At UET JKUAT, we live out our faith actively and intentionally. Every gathering, prayer meeting, outreach, and mission is an opportunity to glorify God, grow spiritually, and reach others with the transforming Gospel of Jesus Christ.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <IconBuilding className="w-6 h-6 text-blue-600" />
                Our Commitment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                UET JKUAT is widely recognized for its unwavering commitment to nurturing young believers in their walk with Christ. Here, you'll find a strong foundation in the Word, opportunities to serve, deep fellowship, bold evangelism, and a spiritual family that prays, fasts, and journeys with you.
              </p>
            </div>
          </div>
        </div>

        {/* Activities Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-8 text-center">Our Activities</h2>
          
          <div className="space-y-6">
            {/* Sunday Fellowship */}
            <div className="border-l-4 border-blue-600 pl-6 py-4 bg-blue-50 rounded-r-lg">
              <div className="flex items-start gap-4">
                <IconCalendar className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Sunday Fellowship</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Every Sunday | 3:30 PM – 5:30 PM</span>
                  </p>
                  <p className="text-gray-600">
                    Our weekly Sunday Fellowship is the heartbeat of UET JKUAT. It's a refreshing time of worship, teaching, testimonies, and deep encounters with God. We welcome all students to experience the presence of God and grow in the Word.
                  </p>
                  <p className="text-sm text-gray-500 mt-2 italic">
                    (Fellowship pauses during long holidays or short academic breaks.)
                  </p>
                </div>
              </div>
            </div>

            {/* Wednesday Prayer */}
            <div className="border-l-4 border-green-600 pl-6 py-4 bg-green-50 rounded-r-lg">
              <div className="flex items-start gap-4">
                <IconBook className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Wednesday – Leaders' Prayer Meeting</h3>
                  <p className="text-gray-600">
                    The executive and ministry leaders come together every Wednesday for a dedicated prayer time. We intercede for the team, the university, the nation, and the body of Christ, trusting God for wisdom and strength to serve faithfully.
                  </p>
                </div>
              </div>
            </div>

            {/* Thursday Activities */}
            <div className="border-l-4 border-purple-600 pl-6 py-4 bg-purple-50 rounded-r-lg">
              <div className="flex items-start gap-4">
                <IconHeartHand className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Thursday – Prayer & Fasting + Family Fellowship</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Prayer & Fasting:</span> We dedicate the day to fasting and corporate prayer as a team on Thursdays. We pray for our ministries, personal lives, families, and the nation, believing God for breakthrough and revival.
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-semibold">Family Fellowship | 7:00 PM – 8:30 PM:</span> In the evening, we gather in small groups (spiritual families) for intimate fellowship, Bible sharing, accountability, and mutual encouragement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuesday Evangelism */}
            <div className="border-l-4 border-red-600 pl-6 py-4 bg-red-50 rounded-r-lg">
              <div className="flex items-start gap-4">
                <IconBuilding className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Tuesday – Evangelism</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Every Tuesday | 5:00 PM – 6:30 PM</span>
                  </p>
                  <p className="text-gray-600">
                    Evangelism is our calling and our heartbeat. Every Tuesday, we hit the streets of Juja and its surrounding areas to share the Good News of Jesus Christ through one-on-one evangelism, open-air preaching, and gospel literature. Souls are being won, lives are being changed, and the Kingdom of God is advancing!
                  </p>
                </div>
              </div>
            </div>

            {/* Missions */}
            <div className="border-l-4 border-yellow-600 pl-6 py-4 bg-yellow-50 rounded-r-lg">
              <div className="flex items-start gap-4">
                <IconCalendar className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Mission Trips</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Throughout the Spiritual Year</span>
                  </p>
                  <p className="text-gray-600 mb-2">
                    Every spiritual year, we organize at least two primary missions to travel to different parts of the country to proclaim the Gospel. Whether in rural villages, urban centers, or unreached regions, we go with boldness, love, and the power of the Holy Spirit. Our mission trips include preaching, door-to-door outreach, school ministry, and youth mentorship.
                  </p>
                  <p className="text-gray-600 font-semibold italic">
                    "We are committed to the utmost!"
                  </p>
                  <p className="text-gray-600 mt-2">
                    God has been faithful in giving us favor, opening doors, and bringing in the harvest. Through missions, we have witnessed salvation, healing, restoration, and revival across Kenya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconBook className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Strong Foundation</h3>
            <p className="text-gray-600">A strong foundation in the Word of God</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconHeartHand className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Service Opportunities</h3>
            <p className="text-gray-600">Opportunities to serve and grow in your calling</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconBuilding className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Deep Fellowship</h3>
            <p className="text-gray-600">Deep fellowship with like-minded believers</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCalendar className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bold Evangelism</h3>
            <p className="text-gray-600">Bold evangelism and practical ministry exposure</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconHeartHand className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Spiritual Family</h3>
            <p className="text-gray-600">A spiritual family that prays, fasts, and journeys with you</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconBook className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mentorship</h3>
            <p className="text-gray-600">Mentorship and discipleship programs</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
