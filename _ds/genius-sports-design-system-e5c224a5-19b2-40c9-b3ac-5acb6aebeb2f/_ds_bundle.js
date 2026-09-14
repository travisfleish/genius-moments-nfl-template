/* @ds-bundle: {"format":4,"namespace":"GeniusSportsDesignSystem_e5c224","components":[],"sourceHashes":{"ui_kits/marketing/Button.jsx":"cff8f5f571c3","ui_kits/marketing/CTA.jsx":"08b7500b2995","ui_kits/marketing/DemoModal.jsx":"a3feeea547f2","ui_kits/marketing/Features.jsx":"8fee4964820a","ui_kits/marketing/Header.jsx":"6fe2f9337a45","ui_kits/marketing/Hero.jsx":"8a0b3cebfb71","ui_kits/marketing/Icons.jsx":"75df4e52bc35","ui_kits/marketing/StatBand.jsx":"e98722e4d08b","ui_kits/marketing/theme.jsx":"09d93c0f9ca4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GeniusSportsDesignSystem_e5c224 = window.GeniusSportsDesignSystem_e5c224 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/marketing/Button.jsx
try { (() => {
// Genius Sports button — pill with hover line-sweep + vertical text swap.
const {
  GS: _GSB
} = window;
const GS_BTN_VARIANTS = {
  navy: {
    bg: "#0D1226",
    text: "#fff",
    hoverText: "#fff",
    line: "#0000DC"
  },
  blue: {
    bg: "#0000DC",
    text: "#fff",
    hoverText: "#fff",
    line: "#95ECFD"
  },
  white: {
    bg: "#fff",
    text: "#0D1226",
    hoverText: "#0000DC",
    line: "#95ECFD",
    border: "#E7E7E9"
  },
  outline: {
    bg: "transparent",
    text: "#0D1226",
    hoverText: "#0D1226",
    line: "#95ECFD",
    border: "#E7E7E9"
  }
};
function GSButton({
  children,
  variant = "navy",
  size = "default",
  onClick,
  style = {}
}) {
  const [hover, setHover] = React.useState(false);
  const v = GS_BTN_VARIANTS[variant] || GS_BTN_VARIANTS.navy;
  const pad = size === "slim" ? "11px 22px" : size === "header" ? "13px 26px" : "15px 36px";
  const fs = size === "slim" || size === "header" ? 16 : 17;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      overflow: "hidden",
      border: v.border ? `1px solid ${hover && variant === "outline" ? GS.lightBlue : v.border}` : "none",
      borderRadius: "125rem",
      background: v.bg,
      padding: pad,
      cursor: "pointer",
      fontFamily: GS.body,
      fontSize: fs,
      fontWeight: variant === "outline" || variant === "white" ? 600 : 500,
      lineHeight: 1,
      transition: "border-color .3s",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      borderRadius: "125rem",
      overflow: "hidden",
      pointerEvents: "none"
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      background: v.line,
      transform: hover ? "translateX(0)" : `translateX(${i % 2 === 0 ? "-101%" : "101%"})`,
      transition: `transform ${hover ? 400 : 300}ms ease-in-out ${i * 80}ms`
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block",
      overflow: "hidden",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      color: v.text,
      transform: hover ? "translateY(-110%)" : "translateY(0)",
      opacity: hover ? 0 : 1,
      transition: "transform .28s ease, opacity .28s ease"
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      color: v.hoverText,
      transform: hover ? "translateY(0)" : "translateY(110%)",
      opacity: hover ? 1 : 0,
      transition: "transform .28s ease, opacity .28s ease",
      fontWeight: variant === "outline" ? 600 : undefined
    }
  }, children)));
}
Object.assign(window, {
  GSButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Button.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/CTA.jsx
try { (() => {
// Blue CTA panel with bleeding spring + footer.
const {
  GS: _GSC
} = window;
function CTA({
  onDemo
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: GS.white,
      padding: "20px 32px 90px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
      background: GS.blue,
      borderRadius: 8,
      padding: "56px 56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 300,
      fontSize: "clamp(1.9rem,3.5vw,2.6rem)",
      letterSpacing: "-0.04em",
      color: "#fff",
      margin: 0,
      maxWidth: 460
    }
  }, "Ready to win the moment?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 17,
      color: "rgba(255,255,255,0.85)",
      margin: "12px 0 0",
      maxWidth: 420
    }
  }, "Talk to our team about powering your data, media or sportsbook strategy.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(GSButton, {
    variant: "white",
    onClick: onDemo
  }, "Get started")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: -40,
      top: "-60%",
      height: "220%",
      opacity: 0.55,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(Spring, {
    color: GS.lightBlue,
    bars: 12,
    gap: 8,
    rotate: 45,
    height: "100%"
  }))));
}
function Footer() {
  const cols = [{
    h: "Products",
    items: ["Sports Data", "Media", "Sportsbook", "Integrity"]
  }, {
    h: "Company",
    items: ["About", "Careers", "Newsroom", "Investors"]
  }, {
    h: "Resources",
    items: ["Insights", "Case studies", "Developers", "Support"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: GS.navy,
      color: "#fff",
      padding: "72px 32px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      display: "flex",
      gap: 40,
      flexWrap: "wrap",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 280
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    color: "white",
    style: {
      height: 26,
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 14,
      lineHeight: 1.5,
      color: "rgba(255,255,255,0.55)"
    }
  }, "The official data, technology and commercial partner to the world of sport.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 56,
      flexWrap: "wrap"
    }
  }, cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: GS.body,
      fontSize: 12,
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "rgba(255,255,255,0.4)",
      marginBottom: 16
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 11
    }
  }, c.items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontFamily: GS.body,
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
      textDecoration: "none"
    }
  }, it)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "44px auto 0",
      paddingTop: 22,
      borderTop: "1px solid rgba(255,255,255,0.12)",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: GS.body,
      fontSize: 13,
      color: "rgba(255,255,255,0.4)"
    }
  }, "\xA9 2026 Genius Sports Limited"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: GS.body,
      fontSize: 13,
      color: "rgba(255,255,255,0.4)"
    }
  }, "Privacy \xB7 Terms \xB7 Cookies")));
}
Object.assign(window, {
  CTA,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/CTA.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/DemoModal.jsx
try { (() => {
// Fake "Book a demo" modal.
const {
  GS: _GSM
} = window;
function DemoModal({
  open,
  onClose
}) {
  const [sent, setSent] = React.useState(false);
  React.useEffect(() => {
    if (open) setSent(false);
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(13,18,38,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "gsFade .2s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: "relative",
      overflow: "hidden",
      width: "100%",
      maxWidth: 460,
      background: "#fff",
      borderRadius: 16,
      padding: "40px 40px 36px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      position: "absolute",
      top: 18,
      right: 18,
      background: "none",
      border: "none",
      cursor: "pointer",
      color: GS.navy,
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(CloseIcon, null)), !sent ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 300,
      fontSize: 30,
      letterSpacing: "-0.04em",
      color: GS.navy,
      margin: "0 0 6px"
    }
  }, "Book a demo"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      color: "rgba(13,18,38,0.7)",
      margin: "0 0 24px"
    }
  }, "See the Genius platform in action. We'll be in touch within one business day."), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    placeholder: "Work email",
    type: "email"
  }), /*#__PURE__*/React.createElement(Field, {
    placeholder: "Company"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(GSButton, {
    variant: "navy",
    style: {
      width: "100%"
    }
  }, "Request demo")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "20px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: GS.brightGreen,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 18px"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5 L10 17.5 L19 7",
    stroke: GS.navy,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 300,
      fontSize: 26,
      letterSpacing: "-0.03em",
      color: GS.navy,
      margin: "0 0 6px"
    }
  }, "You're all set"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      color: "rgba(13,18,38,0.7)",
      margin: 0
    }
  }, "Thanks \u2014 our team will reach out shortly."))));
}
function Field({
  placeholder,
  type = "text"
}) {
  const [f, setF] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", {
    required: true,
    type: type,
    placeholder: placeholder,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      padding: "13px 16px",
      borderRadius: 10,
      border: `1px solid ${f ? GS.blue : GS.lavenderGrey}`,
      outline: "none",
      color: GS.navy,
      transition: "border-color .2s"
    }
  });
}
Object.assign(window, {
  DemoModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/DemoModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Features.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Feature section — tabbed product switcher with brand-icon cards.
const {
  GS: _GSF
} = window;
const GS_TABS = [{
  id: "data",
  label: "Sports Data",
  eyebrow: "Genius data platform",
  heading: "Official data, captured at the source",
  cards: [{
    icon: "LiveData",
    title: "Live data capture",
    body: "Courtside and pitchside collection delivering official feeds in milliseconds."
  }, {
    icon: "Statistics",
    title: "Deep statistics",
    body: "Every event modelled into rich stats powering broadcast, apps and analysis."
  }, {
    icon: "Distribute",
    title: "Global distribution",
    body: "One integration, every sport — pushed to partners worldwide on our cloud."
  }]
}, {
  id: "media",
  label: "Media & Fans",
  eyebrow: "Genius media network",
  heading: "Turn data into fan engagement",
  cards: [{
    icon: "Personalise",
    title: "Personalisation",
    body: "Tailor every moment to the individual fan across web, app and social."
  }, {
    icon: "Video",
    title: "Augmented video",
    body: "Real-time graphics and VR-3D overlays bring the data story to life."
  }, {
    icon: "Reach",
    title: "Audience reach",
    body: "Activate addressable sports audiences for brands at global scale."
  }]
}, {
  id: "sportsbook",
  label: "Sportsbook",
  eyebrow: "Genius sportsbook",
  heading: "Pricing and trading you can trust",
  cards: [{
    icon: "LivePricing",
    title: "Live pricing",
    body: "Automated, low-latency odds across thousands of markets and sports."
  }, {
    icon: "Monetise",
    title: "Monetise traffic",
    body: "Engagement tools and free-to-play that convert fans into players."
  }, {
    icon: "Platform",
    title: "Integrity platform",
    body: "Bet monitoring that protects the integrity of the sports we serve."
  }]
}];
function FeatureCard({
  icon,
  title,
  body
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      flex: "1 1 0",
      minWidth: 240,
      background: GS.white,
      border: `1px solid ${h ? GS.lightBlue : GS.lavenderGrey}`,
      borderRadius: 16,
      padding: "28px 26px 24px",
      transition: "border-color .3s, transform .3s",
      transform: h ? "translateY(-3px)" : "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `../../assets/icons/light/${icon}.png`,
    alt: "",
    style: {
      width: 46,
      height: 46,
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 400,
      fontSize: 22,
      letterSpacing: "-0.03em",
      color: GS.navy,
      margin: "0 0 8px"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      lineHeight: 1.5,
      color: "rgba(13,18,38,0.7)",
      margin: "0 0 18px"
    }
  }, body), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      fontFamily: GS.body,
      fontWeight: 700,
      fontSize: 15,
      color: GS.navy
    }
  }, /*#__PURE__*/React.createElement(RightArrowCircle, {
    size: 26,
    circle: h ? GS.blue : GS.navy,
    arrow: "#fff"
  }), " Learn more"));
}
function Features() {
  const [active, setActive] = React.useState(0);
  const tab = GS_TABS[active];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: GS.snow,
      padding: "100px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement(DotSubheading, null, tab.eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 400,
      fontSize: "clamp(2rem,4.5vw,3.2rem)",
      letterSpacing: "-0.035em",
      color: GS.navy,
      margin: "0 auto",
      maxWidth: 640
    }
  }, tab.heading)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginBottom: 44,
      flexWrap: "wrap"
    }
  }, GS_TABS.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setActive(i),
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      fontWeight: 500,
      padding: "10px 22px",
      borderRadius: "125rem",
      cursor: "pointer",
      border: "none",
      transition: "all .25s",
      background: i === active ? GS.navy : "rgba(13,18,38,0.05)",
      color: i === active ? "#fff" : GS.navy
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20,
      flexWrap: "wrap"
    }
  }, tab.cards.map(c => /*#__PURE__*/React.createElement(FeatureCard, _extends({
    key: c.title
  }, c))))));
}
Object.assign(window, {
  Features
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Features.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Header.jsx
try { (() => {
// Sticky marketing nav header.
const {
  GS: _GSH
} = window;
function Header({
  onDemo
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = ["Data", "Media", "Sportsbook", "Integrity", "Company"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
      backdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
      borderBottom: scrolled ? "1px solid #E7E7E9" : "1px solid transparent",
      transition: "all .3s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    color: "blue",
    style: {
      height: 26
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 26,
      marginLeft: 8
    },
    className: "gs-nav"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      fontWeight: 500,
      color: GS.navy,
      textDecoration: "none",
      opacity: 0.85,
      transition: "color .2s, opacity .2s"
    },
    onMouseEnter: e => {
      e.target.style.color = GS.blue;
      e.target.style.opacity = 1;
    },
    onMouseLeave: e => {
      e.target.style.color = GS.navy;
      e.target.style.opacity = 0.85;
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      fontWeight: 500,
      color: GS.navy,
      textDecoration: "none",
      opacity: 0.85
    },
    className: "gs-nav"
  }, "Sign in"), /*#__PURE__*/React.createElement(GSButton, {
    variant: "navy",
    size: "header",
    onClick: onDemo
  }, "Book a demo"))));
}
Object.assign(window, {
  Header
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
// Hero masthead — eyebrow dot-subheading, big light headline, body, CTAs, flanking springs.
const {
  GS: _GSHero
} = window;
function DotSubheading({
  children,
  dot = "#0000DC"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: GS.lightGrey,
      padding: "8px 24px 8px 12px",
      borderRadius: "125rem 0 0 125rem"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: dot
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: GS.body,
      fontSize: 15,
      color: GS.navy
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "100%",
      top: 0,
      bottom: 0,
      display: "flex",
      alignItems: "stretch",
      gap: 2,
      paddingLeft: 3
    }
  }, [3.5, 3, 2.5, 2, 1.5].map((w, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: w,
      background: GS.lightGrey
    }
  })))));
}
function Hero({
  onDemo
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden",
      background: GS.white,
      padding: "120px 32px 130px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "8%",
      right: "82%",
      height: "84%",
      opacity: 0.9,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(Spring, {
    color: GS.lightGrey,
    bars: 22,
    gap: 6,
    height: "100%"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "8%",
      left: "82%",
      height: "84%",
      opacity: 0.9,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(Spring, {
    color: GS.lightGrey,
    bars: 22,
    gap: 6,
    height: "100%",
    reverse: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 920,
      margin: "0 auto",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(DotSubheading, null, "The official data partner of sport"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 300,
      fontSize: "clamp(2.5rem, 7vw, 5rem)",
      lineHeight: 1.04,
      letterSpacing: "-0.04em",
      color: GS.navy,
      margin: 0,
      maxWidth: 880
    }
  }, "Win the moment with official sports data"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: GS.body,
      fontSize: 19,
      lineHeight: 1.5,
      color: "rgba(13,18,38,0.8)",
      margin: "24px 0 40px",
      maxWidth: 600
    }
  }, "We capture, power and protect live data for the world's biggest leagues \u2014 turning every play into real-time insight, odds and fan engagement."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(GSButton, {
    variant: "navy",
    onClick: onDemo
  }, "Book a demo"), /*#__PURE__*/React.createElement(GSButton, {
    variant: "white"
  }, "Explore the platform"))));
}
Object.assign(window, {
  Hero,
  DotSubheading
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Icons.jsx
try { (() => {
// Inline SVG UI arrows recreated from the brand kit (src/components/icons/Icons.tsx).
function RightArrowCircle({
  size = 26,
  circle = "#0D1226",
  arrow = "#fff"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 27 26",
    fill: "none",
    style: {
      flexShrink: 0,
      transition: "all .3s"
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.8",
    width: "26",
    height: "26",
    rx: "13",
    fill: circle,
    style: {
      transition: "fill .3s"
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.41 9.41 L17 13 M17 13 l-3.59 3.59 M17 13 H9.4",
    stroke: arrow,
    strokeLinejoin: "round"
  }));
}
function RightArrow({
  size = 12,
  color = "currentColor"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5.59 1 L10.59 6 M10.59 6 L5.59 11 M10.59 6 H0",
    stroke: color,
    strokeLinejoin: "round"
  }));
}
function CloseIcon({
  size = 20,
  color = "currentColor"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4 L16 16 M16 4 L4 16",
    stroke: color,
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }));
}
function Logo({
  variant = "horizontal",
  color = "blue",
  style = {}
}) {
  const c = color === "white" ? "WHITE" : "BLUE";
  const v = variant.toUpperCase();
  return /*#__PURE__*/React.createElement("img", {
    src: `../../assets/logos/GENIUS_SPORTS_${v}_${c}_RGB.svg`,
    alt: "Genius Sports",
    style: style
  });
}
Object.assign(window, {
  RightArrowCircle,
  RightArrow,
  CloseIcon,
  Logo
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/StatBand.jsx
try { (() => {
// Navy stat band with accent rules.
const {
  GS: _GSS
} = window;
const GS_STATS = [{
  value: "700+",
  label: "leagues & federations partnered"
}, {
  value: "240B+",
  label: "data points captured each year"
}, {
  value: "350K+",
  label: "events covered annually"
}, {
  value: "<1s",
  label: "latency from field to feed"
}];
function StatBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: GS.navy,
      color: "#fff",
      padding: "84px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      display: "flex",
      gap: 28,
      flexWrap: "wrap"
    }
  }, GS_STATS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      flex: "1 1 180px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: GS.heading,
      fontWeight: 300,
      fontSize: "clamp(2.6rem,5vw,3.6rem)",
      lineHeight: 1,
      letterSpacing: "-0.03em"
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 2,
      background: GS.brightGreen,
      margin: "16px 0 12px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: GS.body,
      fontSize: 14,
      lineHeight: 1.4,
      color: "rgba(255,255,255,0.6)",
      maxWidth: 200
    }
  }, s.label)))));
}
Object.assign(window, {
  StatBand
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/StatBand.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/theme.jsx
try { (() => {
// Shared Genius Sports tokens + small primitives, exported to window for other Babel scripts.
const GS = {
  navy: "#0D1226",
  blue: "#0000DC",
  lightBlue: "#95ECFD",
  brightGreen: "#E1FF67",
  lightGreen: "#18C971",
  green: "#047C40",
  lightPurple: "#C2D1FF",
  purple: "#4337A8",
  lightOrange: "#FFEBAF",
  orange: "#FA5D00",
  lightRed: "#F76B6A",
  red: "#C20000",
  lightGrey: "#F6F7F9",
  lavenderGrey: "#E7E7E9",
  snow: "#FAFAFA",
  white: "#FFFFFF",
  heading: '"KlarheitKurrent", system-ui, sans-serif',
  body: '"RedHatText", system-ui, sans-serif',
  easeSlide: "cubic-bezier(0.68,-0.2,0.15,0.98)",
  easeBounce: "cubic-bezier(0.34,1.56,0.64,1)"
};

// Spring: progressive-width vertical bars. dir 'up' grows left→right, 'down' reverse.
function Spring({
  color = GS.blue,
  bars = 9,
  height = "100%",
  gap = 6,
  rotate = 0,
  reverse = false,
  style = {}
}) {
  const items = Array.from({
    length: bars
  }, (_, i) => i);
  const widths = items.map(i => 1 + Math.pow(i / (bars - 1), 1.8) * 13);
  const order = reverse ? widths.slice().reverse() : widths;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "stretch",
      height,
      gap,
      transform: rotate ? `rotate(${rotate}deg)` : undefined,
      ...style
    }
  }, order.map((w, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: w,
      background: color,
      display: "block",
      borderRadius: 0
    }
  })));
}
Object.assign(window, {
  GS,
  Spring
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/theme.jsx", error: String((e && e.message) || e) }); }

})();
