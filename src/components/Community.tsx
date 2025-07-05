import { motion } from "framer-motion";
import { 
  FaTwitter, 
  FaDiscord, 
  FaTelegram, 
  FaGithub, 
  FaReddit,
  FaMedium 
} from "react-icons/fa";

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/xorionchain?s=21",
    icon: FaTwitter,
    description: "Official X (Twitter)"
  },
  {
    label: "Discord",
    href: "https://discord.gg/ucc278yJZt",
    icon: FaDiscord,
    description: "Community chat"
  },
  {
    label: "Telegram",
    href: "https://t.me/Xorion_Chain",
    icon: FaTelegram,
    description: "Community chat"
  },
  {
    label: "GitHub",
    href: "https://github.com/settings/admin",
    icon: FaGithub,
    description: "Source code and issues"
  },
  {
    label: "Reddit",
    href: "#",
    icon: FaReddit,
    description: "Community forum"
  },
  {
    label: "Medium",
    href: "#",
    icon: FaMedium,
    description: "Read articles"
  }
];

export default function CommunitySection() {
  return (
    <section id="community" className="relative py-12 bg-background overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block"
          >
            <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-4 block">
              Connect With Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Join Our
              <span className="block text-primary">
                Community
              </span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Connect with blockchain enthusiasts, developers, and innovators. 
            Stay updated with the latest developments and help shape the future of XORION.
          </motion.p>
        </motion.div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
          {socialLinks.map((social, index) => (
            <motion.div
              key={social.label}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              className="group"
            >
              <motion.a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block"
              >
                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all duration-300 hover:bg-primary/5 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary">
                      <social.icon size={24} className="text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-foreground font-semibold text-lg mb-1">
                      {social.label}
                    </h3>
                    <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                      {social.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            </motion.div>
          ))}
        </div>

       
      </div>
    </section>
  );
}