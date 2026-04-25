import { motion } from "motion/react";
import { newsItems, currentUser } from "../data/mockData";
import { Clock, Bookmark, ChevronRight, Rss } from "lucide-react";
import { useState } from "react";

const categories = ["All", "Football", "Formula 1", "Cooking", "True Crime", "Photography"];

export function NewsFeed() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [saved, setSaved] = useState<string[]>([]);

  const filtered = activeCategory === "All"
    ? newsItems
    : newsItems.filter(n => n.category === activeCategory);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl">Headlines</h2>
            <p className="text-white/40 text-sm mt-0.5">Curated for {currentUser.nickname}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#4fc3f7]/10 rounded-full px-3 py-1.5">
            <Rss size={11} className="text-[#4fc3f7]" />
            <span className="text-[#4fc3f7] text-xs">Live</span>
          </div>
        </div>
      </div>

      {/* SEREN context */}
      <div className="mx-5 mb-4 bg-[#0d1528] border border-white/8 rounded-xl p-3 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4fc3f7] to-[#1a73e8] flex items-center justify-center flex-shrink-0">
          <div className="flex items-end gap-[2px] h-3">
            {[2, 3, 2].map((h, i) => (
              <div key={i} className="w-[2px] rounded-full bg-white" style={{ height: h * 2 }} />
            ))}
          </div>
        </div>
        <p className="text-white/60 text-xs leading-relaxed">
          "Here's what you've missed, Cal. I know you've been focused on the cargo ops — so I've kept tabs on football, F1, and the other things you care about. No spoilers until you're ready. 📰"
        </p>
      </div>

      {/* Category filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                activeCategory === cat
                  ? "bg-[#4fc3f7] text-[#0a0f1e]"
                  : "bg-white/6 text-white/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News items */}
      <div className="px-5 space-y-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden"
          >
            {/* Image */}
            <div className="h-36 overflow-hidden relative">
              <img
                src={item.image}
                alt={item.headline}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-lg">{item.emoji}</span>
                <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[10px] px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
              <button
                onClick={() => setSaved(prev =>
                  prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                )}
                className="absolute top-3 right-3"
              >
                <Bookmark
                  size={16}
                  className={saved.includes(item.id) ? "text-[#4fc3f7] fill-[#4fc3f7]" : "text-white/50"}
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-white text-sm leading-snug mb-2">{item.headline}</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-3">{item.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-[10px]">{item.source}</span>
                  <div className="flex items-center gap-1 text-white/30">
                    <Clock size={9} />
                    <span className="text-[10px]">{item.time}</span>
                  </div>
                  <span className="text-white/20 text-[10px]">{item.readTime} read</span>
                </div>
                <button className="text-[#4fc3f7] text-xs flex items-center gap-0.5">
                  Read <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interests note */}
      <div className="mx-5 mt-4 bg-white/3 border border-white/6 rounded-xl p-3">
        <p className="text-white/30 text-[11px] leading-relaxed text-center">
          Stories curated from your interests: {currentUser.interests.join(" · ")}
        </p>
      </div>
    </div>
  );
}
