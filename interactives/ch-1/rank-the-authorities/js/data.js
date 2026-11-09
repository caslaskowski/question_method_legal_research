/* Auto-generated from data/*.json by build.py — do not edit by hand. */

window.HOME = {
  "title": "Hierarchy of Authorities",
  "subtitle": "When two sources point in different directions, one controls. This module shows why — and which one.",
  "eyebrow": "Chapter 1 · Foundations of Legal Authority",
  "intro": "Finding sources is only half of legal research. The other half is knowing what to do with them. Before you can answer any legal question, you need to know which of your sources actually settles the matter — and which ones only inform. This module maps the structure that decides.",
  "method": {
    "eyebrow": "How this relates to the Question Method",
    "body": "The Question Method tells you when to keep researching and when you can stop. That decision turns entirely on authority. A binding, on-point source can close a question; a merely persuasive source means the answer is still open and you keep looking. You cannot know whether you are done until you know which of your sources could actually control the court that matters."
  },
  "atAGlance": {
    "caption": "Types of authority compared",
    "columns": [
      "Authority",
      "Primary or secondary?",
      "Can it bind?",
      "What determines whether it binds"
    ],
    "rows": [
      [
        "Constitution",
        "Primary",
        "Yes — supreme",
        "Sits above every other law in its jurisdiction; no lower authority may conflict"
      ],
      [
        "Statute",
        "Primary",
        "Yes",
        "Binds within its jurisdiction; outranks regulations and common law on the same subject"
      ],
      [
        "Regulation",
        "Primary",
        "Yes",
        "Binds if validly issued under an authorizing statute; yields to the statute itself"
      ],
      [
        "Case (judicial opinion)",
        "Primary",
        "Yes — conditionally",
        "Binds only if from a higher court in the same system for the same jurisdiction"
      ],
      [
        "Treatise, encyclopedia, law review, Restatement",
        "Secondary",
        "No",
        "Always persuasive at most — used to find and understand the law, never to settle it"
      ]
    ]
  },
  "nav": [
    {
      "id": "hierarchy",
      "label": "The Hierarchy of Authority",
      "page": "hierarchy.html",
      "kicker": "Explore",
      "blurb": "An interactive map of how authority layers — how higher law controls lower law, and why the same case can bind in one courtroom and only persuade in another."
    }
  ],
  "companion": {
    "title": "Companion Notes",
    "description": "A fill-in-the-blanks worksheet. Work through it alongside the module — completed, it becomes a one-page reference for weighing authority on any research problem.",
    "buttonText": "Download Companion Notes (.txt)"
  }
};

window.HIERARCHY = {
  "intro": "Authority is not a flat pile. It is layered, and the layers decide which source wins when two of them point in different directions. This page lays out three things you have to hold in your head before you can rank anything: the vertical hierarchy of authority, the line between primary and secondary sources, and the rule that the same case can be binding in one courtroom and merely persuasive in another.",
  "pyramid": {
    "eyebrow": "The hierarchy of authority",
    "lede": "Within a single system, higher law controls lower law. Federal law, where it applies, sits above state law (the Supremacy Clause). The pyramid is the textbook’s Figure 1.2 — read it top to bottom.",
    "levels": [
      {
        "tier": "federal",
        "label": "U.S. Constitution",
        "note": "The supreme law of the land. Any law that conflicts with it is invalid."
      },
      {
        "tier": "federal",
        "label": "Federal statutes & treaties",
        "note": "Enacted by Congress (or made under its treaty power). Bind nationwide within federal authority."
      },
      {
        "tier": "federal",
        "label": "Federal regulations",
        "note": "Issued by agencies under a statute. Valid only within the authority the statute grants."
      },
      {
        "tier": "federal",
        "label": "Federal case law",
        "note": "Federal courts interpreting federal law; binding effect runs down each circuit’s own ladder."
      },
      {
        "tier": "state",
        "label": "State constitution",
        "note": "Supreme within the state — so long as it does not conflict with federal law."
      },
      {
        "tier": "state",
        "label": "State statutes",
        "note": "Enacted by the state legislature; outrank state regulations and state common law on the same subject."
      },
      {
        "tier": "state",
        "label": "State regulations",
        "note": "Issued by state agencies under a state statute."
      },
      {
        "tier": "state",
        "label": "State case law",
        "note": "State courts interpreting state law; binding effect runs down that state’s own ladder."
      },
      {
        "tier": "local",
        "label": "Local ordinances",
        "note": "City and county rules, valid within the powers the state grants them."
      }
    ],
    "note": "Two cautions the chapter stresses: where federal law sets only a floor (much environmental and labor law), a state may go stricter — so check preemption before you assume federal law wins. And being struck down is not the same as being erased: an unconstitutional statute usually still appears in the code, findable but unenforceable."
  },
  "primarySecondary": {
    "eyebrow": "Primary vs. secondary",
    "body": "Primary authority is the law itself — constitutions, statutes, regulations, cases, treaties. Secondary sources explain, summarize, or analyze the law without being the law: treatises, legal encyclopedias, law review articles, and Restatements. Think of secondary sources as the road map and primary authority as the road. You read the map to find the road, then you travel the road. In practice you usually start in secondary sources and end in primary authority — and you cite primary authority, not the map, when it counts.",
    "callout": "A Restatement reads like a code and is enormously influential, but it is still secondary — a court is never required to follow it. Influence is not the same as binding force."
  },
  "forumExplorers": [
    {
      "eyebrow": "Binding vs. persuasive — it depends on the court",
      "heading": "The same source can bind — or not",
      "lede": "Whether a primary authority binds depends on which court is deciding and what kind of question is before it. Switch between the two Arizona courts below and watch how the same decisions change weight.",
      "forums": [
        {
          "id": "az_sup",
          "label": "Arizona Superior Court (an Arizona-law question)"
        },
        {
          "id": "az_supreme_con",
          "label": "Arizona Supreme Court (a federal constitutional question)"
        }
      ],
      "authorities": [
        {
          "label": "Arizona Supreme Court decision (on Arizona law)",
          "weight": {
            "az_sup": "binding",
            "az_supreme_con": "persuasive"
          },
          "why": {
            "az_sup": "The Arizona Supreme Court is the highest court in the state system. Its decisions bind every Arizona court below it.",
            "az_supreme_con": "A court is not bound by its own prior decisions — it retains the power to overrule itself. Prior Arizona Supreme Court decisions are powerfully persuasive but the court may depart from them."
          }
        },
        {
          "label": "Arizona Court of Appeals decision",
          "weight": {
            "az_sup": "binding",
            "az_supreme_con": "persuasive"
          },
          "why": {
            "az_sup": "The Arizona Court of Appeals sits directly above the Arizona Superior Court in the same system. Its published decisions bind the trial court below.",
            "az_supreme_con": "Binding force runs from higher courts to lower courts, never upward. The Arizona Supreme Court is above the Court of Appeals; a lower court cannot bind the court above it."
          }
        },
        {
          "label": "U.S. Court of Appeals for the Ninth Circuit (a federal question)",
          "weight": {
            "az_sup": "persuasive",
            "az_supreme_con": "persuasive"
          },
          "why": {
            "az_sup": "Federal circuit courts do not bind state courts. On an Arizona-law question, the Ninth Circuit’s views are informative but not mandatory.",
            "az_supreme_con": "State courts follow the U.S. Supreme Court on the meaning of the federal Constitution — not the circuit courts. The Ninth Circuit’s constitutional reasoning may inform the Arizona Supreme Court but does not control it."
          }
        },
        {
          "label": "U.S. District Court for a District in California (a federal question)",
          "weight": {
            "az_sup": "persuasive",
            "az_supreme_con": "persuasive"
          },
          "why": {
            "az_sup": "A federal trial court in another state has no authority in Arizona’s system. Its decisions are persuasive at most and rarely carried this far.",
            "az_supreme_con": "Federal district court decisions are not binding precedent even within the federal system. For the Arizona Supreme Court, a California district court decision is at best a persuasive data point."
          }
        }
      ]
    },
    {
      "eyebrow": "Jurisdiction lines cut both ways",
      "heading": "Now switch the question — and the court",
      "lede": "Here the same authorities appear before two very different courts: one applying state law, one applying a federal regulation. Some sources bind both courts; most bind only one. Watch which flip and which hold steady.",
      "forums": [
        {
          "id": "tx_state",
          "label": "Texas state trial court (a Texas-law question)"
        },
        {
          "id": "ga_app",
          "label": "Georgia Court of Appeals (applying a federal regulation)"
        }
      ],
      "authorities": [
        {
          "label": "Texas Supreme Court decision (on Texas law)",
          "weight": {
            "tx_state": "binding",
            "ga_app": "persuasive"
          },
          "why": {
            "tx_state": "The Texas Supreme Court is the highest civil court in Texas. Its decisions bind all Texas courts below it on Texas-law questions.",
            "ga_app": "Texas precedent carries no authority in Georgia. A Georgia court applying federal regulation looks to federal courts and Georgia’s own courts — not another state’s supreme court."
          }
        },
        {
          "label": "U.S. Court of Appeals for the Fifth Circuit (interpreting the federal regulation)",
          "weight": {
            "tx_state": "persuasive",
            "ga_app": "persuasive"
          },
          "why": {
            "tx_state": "The Fifth Circuit governs federal courts in Texas — not state courts deciding state-law questions. Federal circuit precedent does not bind Texas state courts.",
            "ga_app": "Georgia sits in the Eleventh Circuit, not the Fifth. A sister circuit’s interpretation of a federal regulation is often persuasive and worth citing, but it carries no mandatory weight outside its own circuit."
          }
        },
        {
          "label": "U.S. Court of Appeals for the Eleventh Circuit (interpreting the federal regulation)",
          "weight": {
            "tx_state": "persuasive",
            "ga_app": "binding"
          },
          "why": {
            "tx_state": "The Eleventh Circuit covers Georgia, Alabama, and Florida — not Texas. Its regulatory interpretations carry no binding authority in the Texas state system.",
            "ga_app": "When a Georgia court applies a federal regulation, the Eleventh Circuit’s interpretation of that regulation is the authoritative federal word within this jurisdiction. Georgia courts treat it as binding on the federal question."
          }
        },
        {
          "label": "U.S. Supreme Court decision (interpreting the same federal regulation)",
          "weight": {
            "tx_state": "binding",
            "ga_app": "binding"
          },
          "why": {
            "tx_state": "On questions of federal law — including federal regulations — the U.S. Supreme Court is the final authority. Every court in the country, state and federal, must follow its interpretations.",
            "ga_app": "The U.S. Supreme Court settles federal questions for all courts everywhere. Its interpretation of a federal regulation ends the inquiry in any courtroom in the country."
          }
        },
        {
          "label": "Georgia Supreme Court decision",
          "weight": {
            "tx_state": "persuasive",
            "ga_app": "binding"
          },
          "why": {
            "tx_state": "Another state’s supreme court has no authority in Texas. Georgia decisions are persuasive references, nothing more.",
            "ga_app": "The Georgia Supreme Court is Georgia’s highest court. Its decisions bind all Georgia courts below it, including the Court of Appeals — even when the issue before the lower court involves federal regulation."
          }
        }
      ]
    }
  ]
};

window.DRILLS = {
  "primary-secondary": {
    "eyebrow": "Drill · Classification",
    "title": "Primary vs. Secondary",
    "instructions": "For each source, decide whether it is primary authority (the law itself) or a secondary source (something that explains or analyzes the law). After you answer, read the feedback — the reasoning is the point, not the score.",
    "options": [
      {
        "id": "primary",
        "text": "Primary authority"
      },
      {
        "id": "secondary",
        "text": "Secondary source"
      }
    ],
    "items": [
      {
        "id": "ps1",
        "prompt": "A section of the Arizona Revised Statutes governing a landlord’s duties.",
        "correct": "primary",
        "feedback": {
          "correct": "Right. A statute is the law itself, enacted by the legislature — a core primary authority.",
          "secondary": "A statute is not a commentary on the law; it is the law. Enacted text from a legislature is primary authority."
        }
      },
      {
        "id": "ps2",
        "prompt": "A United States Supreme Court opinion.",
        "correct": "primary",
        "feedback": {
          "correct": "Right. A judicial opinion is primary authority — the court is making and applying law, not summarizing it.",
          "secondary": "Cases are primary authority. The court is deciding the law, not describing someone else’s account of it."
        }
      },
      {
        "id": "ps3",
        "prompt": "A regulation published in the Code of Federal Regulations.",
        "correct": "primary",
        "feedback": {
          "correct": "Right. A validly issued regulation carries the force of law, so it is primary authority — even though it sits below the statute that authorized it.",
          "secondary": "Regulations are primary authority: properly adopted, they bind like law. Ranking below a statute does not make a source secondary."
        }
      },
      {
        "id": "ps4",
        "prompt": "A law review article analyzing a recent line of cases.",
        "correct": "secondary",
        "feedback": {
          "correct": "Right. A law review article comments on and analyzes the law. It is secondary — a tool for understanding and finding primary authority.",
          "primary": "An article is not the law; it is one scholar’s analysis of it. That makes it a secondary source, however persuasive its argument."
        }
      },
      {
        "id": "ps5",
        "prompt": "A legal encyclopedia entry summarizing an area of law.",
        "correct": "secondary",
        "feedback": {
          "correct": "Right. An encyclopedia describes the legal landscape and points you toward primary authority. It is a classic secondary source — a good place to start.",
          "primary": "An encyclopedia summarizes the law for orientation; it is not itself the law. That is the definition of a secondary source."
        }
      },
      {
        "id": "ps6",
        "prompt": "A section of the Restatement (Second) of Torts.",
        "correct": "secondary",
        "feedback": {
          "correct": "Right — and this one trips people up. A Restatement reads like a code and is highly influential, but it is written by scholars, not enacted by a legislature or decided by a court. It is secondary, and never binding on its own.",
          "primary": "It looks like a statute, but a Restatement is drafted by the American Law Institute, not enacted into law. Influence is not the same as binding force — it is secondary."
        }
      },
      {
        "id": "ps7",
        "prompt": "The Fourteenth Amendment to the U.S. Constitution.",
        "correct": "primary",
        "feedback": {
          "correct": "Right. A constitution is the supreme primary authority in its jurisdiction — nothing ranks higher.",
          "secondary": "A constitution is the foundational law itself, not a commentary on it. It is primary — and the highest primary authority there is."
        }
      },
      {
        "id": "ps8",
        "prompt": "A practitioner treatise on contract law (for example, a multi-volume set with annual supplements).",
        "correct": "secondary",
        "feedback": {
          "correct": "Right. A treatise organizes and explains a doctrine and points you to the cases and statutes that govern it. Useful and respected — but secondary.",
          "primary": "A treatise is an expert’s synthesis of the law, not the law. It is a secondary source — the map, not the road."
        }
      }
    ]
  },
  "binding-persuasive": {
    "eyebrow": "Drill · Classification",
    "title": "Binding vs. Persuasive",
    "instructions": "Each item names the deciding court and an authority before it. Decide whether the court must follow the authority (binding) or may merely consider it (persuasive). Watch two things: the jurisdiction line and the court system.",
    "options": [
      {
        "id": "binding",
        "text": "Binding (must follow)"
      },
      {
        "id": "persuasive",
        "text": "Persuasive (may consider)"
      }
    ],
    "items": [
      {
        "id": "bp1",
        "prompt": "Before the Arizona Court of Appeals: a prior Arizona Supreme Court decision on the same issue.",
        "correct": "binding",
        "feedback": {
          "correct": "Right. The Arizona Supreme Court is a higher court in the same system, so its decisions bind the Arizona Court of Appeals.",
          "persuasive": "Both courts sit in Arizona’s system, and the Supreme Court is above the Court of Appeals. A higher court in the same system binds — this is mandatory authority."
        }
      },
      {
        "id": "bp2",
        "prompt": "Before an Arizona trial court: a California Supreme Court decision squarely on point.",
        "correct": "persuasive",
        "feedback": {
          "correct": "Right. California’s law has no binding effect in Arizona. The decision may persuade, but the Arizona court is free to disregard it.",
          "binding": "Watch the jurisdiction line. A California decision — however on point — does not bind an Arizona court. It is persuasive only."
        }
      },
      {
        "id": "bp3",
        "prompt": "Before a U.S. District Court: a published decision of the U.S. Court of Appeals for the circuit in which that district sits.",
        "correct": "binding",
        "feedback": {
          "correct": "Right. The circuit court is the district court’s direct superior in the same federal system, so its precedent binds.",
          "persuasive": "The district court sits within that circuit, and the circuit court is above it in the same system. Its published precedent is binding."
        }
      },
      {
        "id": "bp4",
        "prompt": "Before the Arizona Supreme Court: a decision of the Arizona Court of Appeals (a lower court).",
        "correct": "persuasive",
        "feedback": {
          "correct": "Right. Precedent binds downward, not upward. A lower court’s decision does not bind the higher court — the Arizona Supreme Court may follow it or not.",
          "binding": "Binding effect runs from higher courts to lower courts in the same system, never the other way. A lower court cannot bind the court above it."
        }
      },
      {
        "id": "bp5",
        "prompt": "Before any state trial court: a U.S. Supreme Court decision interpreting the U.S. Constitution.",
        "correct": "binding",
        "feedback": {
          "correct": "Right. On the meaning of the U.S. Constitution, the U.S. Supreme Court binds every court in the country — state and federal alike.",
          "persuasive": "Federal constitutional rulings from the U.S. Supreme Court bind all courts. This is mandatory authority everywhere."
        }
      },
      {
        "id": "bp6",
        "prompt": "Before an Arizona trial court: a well-regarded treatise that states the rule clearly.",
        "correct": "persuasive",
        "feedback": {
          "correct": "Right. A treatise is a secondary source, and secondary sources are never binding — no matter how authoritative they sound.",
          "binding": "No secondary source binds a court. A treatise can persuade and can point you to binding authority, but it cannot control the outcome."
        }
      },
      {
        "id": "bp7",
        "prompt": "Before a U.S. District Court sitting in the Ninth Circuit: a decision of the U.S. Court of Appeals for the Second Circuit.",
        "correct": "persuasive",
        "feedback": {
          "correct": "Right. The Second Circuit is a coordinate court in a different part of the federal system; it does not bind a district court in the Ninth Circuit. Persuasive only.",
          "binding": "Only the district court’s own circuit binds it. A sister circuit’s decision is persuasive — useful, but the court need not follow it."
        }
      }
    ]
  },
  "statute-common": {
    "eyebrow": "Drill · Which controls",
    "title": "Statute vs. Common Law",
    "instructions": "Statutes and judge-made (common-law) rules often address the same ground. These items drill the rule from Chapter 1: a statute controls over common law on the same subject — and its limits.",
    "items": [
      {
        "id": "sc1",
        "prompt": "For decades a state’s courts applied a common-law rule on a question. The legislature then enacted a statute squarely addressing the same question and setting a different rule. Which governs going forward?",
        "options": [
          {
            "id": "statute",
            "text": "The statute"
          },
          {
            "id": "common",
            "text": "The older common-law rule"
          },
          {
            "id": "court",
            "text": "Whichever a court prefers, case by case"
          }
        ],
        "correct": "statute",
        "feedback": {
          "correct": "Right. On a subject a statute actually addresses, the statute controls over inconsistent common law. The legislature can displace or modify judge-made rules.",
          "common": "Common law yields when the legislature speaks to the same subject. The newer statute displaces the inconsistent common-law rule.",
          "court": "Courts do not pick freely between them. Where a statute squarely governs the subject, the court must apply the statute over conflicting common law."
        }
      },
      {
        "id": "sc2",
        "prompt": "On a particular question, the legislature has never enacted anything at all — no statute speaks to it. Where does the governing rule come from?",
        "options": [
          {
            "id": "common",
            "text": "The common law (the courts)"
          },
          {
            "id": "statute",
            "text": "A statute you simply haven’t found yet"
          },
          {
            "id": "none",
            "text": "Nowhere — there is no law on the point"
          }
        ],
        "correct": "common",
        "feedback": {
          "correct": "Right. Where the legislature has not acted, the common law supplies the rule. Statutes displace common law only on subjects they actually address.",
          "statute": "Don’t assume a hidden statute. When the legislature truly has not spoken, the common law governs the question — that is its proper domain.",
          "none": "Silence by the legislature does not mean a legal vacuum. Courts supply the rule through the common law where no statute governs."
        }
      },
      {
        "id": "sc3",
        "prompt": "A statute governs the subject, but a word in it is ambiguous. A court issues an opinion interpreting that word. Does the court’s opinion now outrank the statute?",
        "options": [
          {
            "id": "no",
            "text": "No — the statute still controls; the case supplies its meaning"
          },
          {
            "id": "yes",
            "text": "Yes — the later case beats the earlier statute"
          },
          {
            "id": "depends",
            "text": "Only if the court says it is overruling the statute"
          }
        ],
        "correct": "no",
        "feedback": {
          "correct": "Right. Interpreting a statute is not the same as overriding it. The statute remains the controlling law; the case settles what its words mean and how they apply.",
          "yes": "A court interpreting a statute does not displace it — the two work together. The statute controls; the opinion fixes its meaning. (And the legislature can amend the statute if it dislikes the reading.)",
          "depends": "A court cannot ‘overrule’ a statute by interpreting it. It clarifies the statute’s meaning; the statute itself remains the governing authority."
        }
      },
      {
        "id": "sc4",
        "prompt": "A statute is clear, but a litigant argues it violates the constitution. The court agrees. Which authority wins?",
        "options": [
          {
            "id": "constitution",
            "text": "The constitution — the court can refuse to enforce the statute"
          },
          {
            "id": "statute",
            "text": "The statute — enacted law always controls"
          },
          {
            "id": "common",
            "text": "The common law fills the gap automatically"
          }
        ],
        "correct": "constitution",
        "feedback": {
          "correct": "Right. The constitution sits above ordinary statutes. A court can hold a statute unconstitutional and refuse to enforce it — though the text usually stays printed in the code, findable but unenforceable.",
          "statute": "Statutes outrank regulations and common law, but not the constitution. A statute that conflicts with the constitution is invalid.",
          "common": "This is a clash between a statute and the constitution, not a gap for the common law. The higher law — the constitution — controls."
        }
      }
    ]
  }
};

window.RANK = {
  "eyebrow": "Apply · Tiered ranking",
  "title": "Rank the Stack",
  "instructions": "Each scenario gives you a single jurisdiction, one issue, and a stack of authorities in no particular order. Assign each authority to a tier by its binding effect. The tiers are ordered top to bottom; within a tier, order does not matter — ties are expected and correct. Check your work to see the reasoning and a model ranking.",
  "tiers": [
    {
      "id": "controls",
      "label": "Controls",
      "blurb": "Binding here and at the top of the hierarchy for this issue — this is what settles the question."
    },
    {
      "id": "binding-sub",
      "label": "Binding, subordinate",
      "blurb": "Must be followed, but yields to anything in ‘Controls’ if they conflict."
    },
    {
      "id": "persuasive",
      "label": "Persuasive",
      "blurb": "Not binding here; the court may consider it."
    },
    {
      "id": "secondary",
      "label": "Secondary / finding tool",
      "blurb": "Never the law itself — where you start, not where you end."
    }
  ],
  "scenarios": [
    {
      "id": "az-landlord",
      "title": "Arizona landlord-tenant issue",
      "context": "You are before an Arizona trial court (Superior Court) on a question of Arizona landlord-tenant law. Rank these authorities by binding effect on that court.",
      "tiePairs": [
        [
          "az-statute",
          "az-supreme"
        ]
      ],
      "authorities": [
        {
          "id": "az-statute",
          "label": "An on-point Arizona statute (Arizona Revised Statutes) setting the landlord’s duty",
          "tier": "controls",
          "why": "An on-point statute from the forum’s own jurisdiction is binding and sits at the top of the enacted-law hierarchy for this issue. It controls — tied with the state high court’s reading of it."
        },
        {
          "id": "az-supreme",
          "label": "An Arizona Supreme Court decision interpreting that statute",
          "tier": "controls",
          "why": "The state’s highest court, binding on the trial court, and authoritative on what the statute means. It works together with the statute — you cannot rank one beneath the other, so both control."
        },
        {
          "id": "az-appeals",
          "label": "An Arizona Court of Appeals decision applying the statute",
          "tier": "binding-sub",
          "why": "Binding on the trial court (a higher court in the same system), but subordinate to both the statute and the Arizona Supreme Court above it."
        },
        {
          "id": "az-reg",
          "label": "An Arizona administrative regulation on a related detail",
          "tier": "binding-sub",
          "why": "A validly issued regulation binds, but a statute outranks a regulation on the same subject — so it sits below the controlling statute."
        },
        {
          "id": "ca-case",
          "label": "A California Supreme Court decision on a similar statute",
          "tier": "persuasive",
          "why": "Another jurisdiction’s law does not bind an Arizona court. Useful if Arizona law were unsettled, but persuasive only."
        },
        {
          "id": "lawreview",
          "label": "A law review article analyzing the issue",
          "tier": "secondary",
          "why": "A secondary source: it can orient you and point to primary authority, but it is never the law and never binds."
        },
        {
          "id": "encyclopedia",
          "label": "A legal encyclopedia entry on landlord duties",
          "tier": "secondary",
          "why": "Secondary authority — a starting place for orientation, not something a court must (or may) treat as law."
        }
      ]
    },
    {
      "id": "fed-statute",
      "title": "Federal statutory question",
      "context": "You are before a U.S. District Court sitting in the Ninth Circuit, on a question under a federal statute. Rank these authorities by binding effect on that court.",
      "tiePairs": [
        [
          "us-statute",
          "scotus"
        ]
      ],
      "authorities": [
        {
          "id": "us-statute",
          "label": "The on-point federal statute (U.S. Code)",
          "tier": "controls",
          "why": "The governing enacted law itself, binding nationwide within federal authority. It controls — tied with the Supreme Court’s interpretation of it."
        },
        {
          "id": "scotus",
          "label": "A U.S. Supreme Court decision interpreting that statute",
          "tier": "controls",
          "why": "The top of the federal judicial system; binding on every federal court and authoritative on the statute’s meaning. Statute and Supreme Court reading control together."
        },
        {
          "id": "ninth",
          "label": "A Ninth Circuit decision interpreting the statute",
          "tier": "binding-sub",
          "why": "Binding on the district court (its own circuit), but subordinate to the Supreme Court and the statute above it."
        },
        {
          "id": "fed-reg",
          "label": "A federal regulation implementing the statute",
          "tier": "binding-sub",
          "why": "A valid regulation binds, but it draws its force from the statute and yields to it — so it ranks below the controlling statute."
        },
        {
          "id": "second-cir",
          "label": "A Second Circuit decision on the same statute",
          "tier": "persuasive",
          "why": "A sister circuit does not bind a district court in the Ninth Circuit. Persuasive — the court may weigh its reasoning but need not follow it."
        },
        {
          "id": "treatise",
          "label": "A treatise on the statutory scheme",
          "tier": "secondary",
          "why": "Secondary authority: helpful for understanding the framework and finding cases, but never binding."
        }
      ]
    }
  ]
};

window.COURTS = {
  "eyebrow": "Apply · Court systems",
  "title": "Court Up / Court Down",
  "intro": "Precedent runs down a single court system: a court is bound by the courts above it in its own system, and binds the courts below it. Place a court correctly and you know at a glance whose decisions control it. Given a court, name the court directly above it (the one whose decisions bind it) and the court directly below it (the one it binds).",
  "bluebookNote": "Court structures and names are not intuitive. Verify the exact name and abbreviation of every court in Table 1 (United States Jurisdictions) of your Bluebook before you rely on it — this exercise is your chance to look them up and remember them.",
  "watchOut": "Two traps to watch. First, stay inside one system: a federal Court of Appeals does not sit ‘above’ a state trial court — they are different systems. Second, names lie: New York’s trial court is called the ‘Supreme Court,’ and its highest court is the ‘Court of Appeals.’ Read the structure, not the label.",
  "modes": {
    "intro": {
      "label": "Introductory",
      "blurb": "Name the court directly above and below each court."
    },
    "advanced": {
      "label": "Advanced",
      "blurb": "Same placements, plus the reporter each court publishes in — and a few trickier courts. Confirm every reporter’s exact series and abbreviation in Bluebook Table 1."
    }
  },
  "reporterNote": "A reporter is the published set of volumes a court’s decisions appear in. Appellate decisions are routinely reported; trial-court decisions usually are not (the federal district courts are the main exception). Where a court has both an official and a regional reporter, either is accepted here — but always cite the form your jurisdiction’s rules and Bluebook Table 1 require.",
  "ladders": [
    {
      "system": "Federal",
      "rungs": [
        "Supreme Court of the United States (highest)",
        "U.S. Courts of Appeals — the circuits (intermediate appellate)",
        "U.S. District Courts (trial)"
      ],
      "note": "Arizona sits in the Ninth Circuit. Specialized and limited courts exist, but this is the core appellate ladder."
    },
    {
      "system": "Arizona",
      "rungs": [
        "Arizona Supreme Court (highest)",
        "Arizona Court of Appeals (intermediate appellate)",
        "Arizona Superior Court (trial, general jurisdiction)"
      ],
      "note": "Limited-jurisdiction courts (justice and municipal courts) sit below the Superior Court, but the ladder above is what drives binding precedent."
    },
    {
      "system": "California",
      "rungs": [
        "Supreme Court of California (highest)",
        "California Courts of Appeal (intermediate appellate)",
        "California Superior Courts (trial)"
      ],
      "note": "A clean three-tier system, like Arizona’s."
    },
    {
      "system": "New York (read carefully)",
      "rungs": [
        "New York Court of Appeals (highest — yes, the top)",
        "Appellate Division of the Supreme Court (intermediate appellate)",
        "New York Supreme Court (trial — yes, the trial court)"
      ],
      "note": "The famous trap: in New York the ‘Supreme Court’ is the trial court and the ‘Court of Appeals’ is the highest court — the reverse of what the names suggest."
    }
  ],
  "items": [
    {
      "id": "c1",
      "court": "U.S. District Court for the District of Arizona",
      "system": "Federal",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "us court of appeals for the ninth circuit",
          "ninth circuit",
          "9th circuit",
          "court of appeals for the ninth circuit",
          "us court of appeals ninth circuit",
          "ninth circuit court of appeals",
          "united states court of appeals for the ninth circuit",
          "us courts of appeals for the ninth circuit",
          "united states courts of appeals for the ninth circuit",
          "ninth circuit us court of appeals",
          "ninth circuit us courts of appeals",
          "courts of appeals for the ninth circuit",
          "court of appeals ninth circuit",
          "ninth circuit court of appeals ninth circuit"
        ],
        "canonical": "U.S. Court of Appeals for the Ninth Circuit",
        "why": "The District of Arizona sits within the Ninth Circuit, so the Ninth Circuit is the court directly above it and its decisions bind this district court."
      },
      "below": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "nothing",
          "no court",
          "trial court",
          "it is a trial court",
          "this is the trial court"
        ],
        "canonical": "None — it is a trial court",
        "why": "A U.S. District Court is the federal trial court; there is no court below it in the appellate ladder."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "federal supplement",
          "fed supplement",
          "f. supp.",
          "f supp",
          "fsupp",
          "f. supp. 3d",
          "f supp 3d",
          "fsupp3d",
          "f. supp. 2d",
          "f supp 2d",
          "fsupp2d"
        ],
        "canonical": "Federal Supplement (F. Supp. 3d)",
        "why": "Federal district-court opinions that get published appear in the Federal Supplement (current series F. Supp. 3d) — but most trial-court rulings are never published at all. Confirm the series in Bluebook Table 1."
      }
    },
    {
      "id": "c2",
      "court": "U.S. Court of Appeals for the Ninth Circuit",
      "system": "Federal",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "supreme court of the united states",
          "us supreme court",
          "united states supreme court",
          "scotus",
          "supreme court"
        ],
        "canonical": "Supreme Court of the United States",
        "why": "Only the Supreme Court of the United States sits above the circuit courts in the federal system."
      },
      "below": {
        "ask": true,
        "accept": [
          "us district courts",
          "united states district courts",
          "district courts",
          "us district court",
          "district court",
          "federal district courts",
          "federal district court",
          "us federal district courts",
          "united states district courts in the circuit"
        ],
        "canonical": "U.S. District Courts (within the circuit)",
        "why": "The circuit court binds the U.S. District Courts in its circuit — the trial courts directly below it."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "federal reporter",
          "fed reporter",
          "f.4th",
          "f 4th",
          "f4th",
          "f.3d",
          "f 3d",
          "f3d",
          "f.2d",
          "f2d",
          "f."
        ],
        "canonical": "Federal Reporter (F.4th)",
        "why": "The U.S. Courts of Appeals publish in the Federal Reporter; the current series is F.4th (after F.3d, F.2d, and F.). Verify in Bluebook Table 1."
      }
    },
    {
      "id": "c3",
      "court": "Arizona Court of Appeals",
      "system": "Arizona",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "arizona supreme court",
          "supreme court of arizona",
          "az supreme court",
          "supreme court of the state of arizona",
          "arizona's supreme court",
          "arizona state supreme court"
        ],
        "canonical": "Arizona Supreme Court",
        "why": "The Arizona Supreme Court is the highest court in Arizona’s system, directly above the Court of Appeals."
      },
      "below": {
        "ask": true,
        "accept": [
          "arizona superior court",
          "superior court",
          "az superior court",
          "superior court of arizona",
          "arizona superior courts"
        ],
        "canonical": "Arizona Superior Court",
        "why": "The Superior Court is Arizona’s general trial court; the Court of Appeals reviews and binds it."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "pacific reporter",
          "p.3d",
          "p 3d",
          "p3d",
          "p.2d",
          "p2d",
          "arizona reports",
          "ariz.",
          "ariz",
          "arizona appeals reports",
          "ariz. app.",
          "ariz app"
        ],
        "canonical": "Pacific Reporter (P.3d) — also the official Arizona Reports (Ariz.)",
        "why": "Arizona appellate decisions appear in the regional Pacific Reporter (P.3d) and the official Arizona Reports (Ariz.). Either is accepted here; confirm the required form in Bluebook Table 1."
      }
    },
    {
      "id": "c4",
      "court": "New York Court of Appeals",
      "system": "New York (read carefully)",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "nothing",
          "no court",
          "highest",
          "highest court",
          "it is the highest",
          "this is the highest court",
          "top"
        ],
        "canonical": "None — it is New York’s highest court",
        "why": "Despite the name, the New York Court of Appeals is the highest court in the state — nothing sits above it in the New York system."
      },
      "below": {
        "ask": true,
        "accept": [
          "appellate division",
          "appellate division of the supreme court",
          "appellate division of the new york supreme court",
          "appellate divisions",
          "new york appellate division",
          "ny appellate division",
          "appellate divisions of the supreme court",
          "new york appellate divisions",
          "appellate division new york"
        ],
        "canonical": "Appellate Division of the Supreme Court",
        "why": "The intermediate appellate court in New York is the Appellate Division of the Supreme Court, directly below the Court of Appeals."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "new york reports",
          "ny reports",
          "n.y.",
          "ny",
          "north eastern reporter",
          "n.e.3d",
          "ne3d",
          "n.e.",
          "ne",
          "new york supplement",
          "n.y.s.3d",
          "nys3d",
          "n.y.s.",
          "nys"
        ],
        "canonical": "New York Reports (N.Y.) — also North Eastern Reporter (N.E.3d)",
        "why": "New York’s high court is published in the official New York Reports (N.Y.) and the regional North Eastern Reporter (N.E.3d). Verify in Bluebook Table 1."
      }
    },
    {
      "id": "c5",
      "court": "New York Supreme Court",
      "system": "New York (read carefully)",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "appellate division",
          "appellate division of the supreme court",
          "appellate division of the new york supreme court",
          "appellate divisions",
          "new york appellate division",
          "ny appellate division",
          "appellate divisions of the supreme court",
          "new york appellate divisions",
          "appellate division new york"
        ],
        "canonical": "Appellate Division of the Supreme Court",
        "why": "In New York the ‘Supreme Court’ is the trial court, so the court directly above it is the Appellate Division — not the Court of Appeals."
      },
      "below": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "nothing",
          "no court",
          "trial court",
          "it is a trial court",
          "this is the trial court"
        ],
        "canonical": "None in the main ladder — it is a trial court",
        "why": "The New York Supreme Court is a trial court of general jurisdiction; the headline appellate ladder has nothing below it."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "not reported",
          "unreported",
          "generally not reported",
          "not published",
          "nothing",
          "no reporter",
          "miscellaneous reports",
          "misc.",
          "misc",
          "misc. 3d",
          "misc 3d",
          "new york supplement",
          "n.y.s.3d",
          "nys3d",
          "n.y.s.",
          "nys"
        ],
        "canonical": "Mostly unreported — some appear in Miscellaneous Reports (Misc. 3d) or the New York Supplement (N.Y.S.3d)",
        "why": "Most trial-court decisions are never published. New York is unusual in reporting some, in Miscellaneous Reports and the New York Supplement. ‘Unreported’ is also accepted. Confirm in Bluebook Table 1."
      }
    },
    {
      "id": "c7",
      "court": "California Court of Appeal",
      "system": "California",
      "level": "intro",
      "above": {
        "ask": true,
        "accept": [
          "supreme court of california",
          "california supreme court",
          "ca supreme court"
        ],
        "canonical": "Supreme Court of California",
        "why": "The Supreme Court of California is the state’s highest court, directly above the Courts of Appeal."
      },
      "below": {
        "ask": true,
        "accept": [
          "california superior court",
          "california superior courts",
          "superior court",
          "ca superior court",
          "superior courts",
          "superior court of california"
        ],
        "canonical": "California Superior Courts",
        "why": "The Superior Courts are California’s trial courts; the Courts of Appeal review and bind them."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "pacific reporter",
          "p.3d",
          "p 3d",
          "p3d",
          "p.2d",
          "p2d",
          "california appellate reports",
          "cal. app.",
          "cal app",
          "cal. app. 5th",
          "cal app 5th",
          "california reporter",
          "cal. rptr.",
          "cal rptr",
          "cal. rptr. 3d",
          "cal rptr 3d"
        ],
        "canonical": "California Appellate Reports (Cal. App. 5th) — also Pacific Reporter (P.3d)",
        "why": "California intermediate decisions appear in California Appellate Reports and the regional Pacific Reporter (P.3d). Confirm the exact series in Bluebook Table 1."
      }
    },
    {
      "id": "c6",
      "court": "Arizona Superior Court",
      "system": "Arizona",
      "level": "advanced",
      "above": {
        "ask": true,
        "accept": [
          "arizona court of appeals",
          "court of appeals",
          "az court of appeals",
          "arizona court of appeals division",
          "court of appeals of arizona",
          "arizona courts of appeal",
          "courts of appeal of arizona",
          "arizona intermediate appellate court"
        ],
        "canonical": "Arizona Court of Appeals",
        "why": "Within Arizona’s own system, the Court of Appeals reviews the Superior Court and binds it. The Ninth Circuit is a different system and does not sit above a state trial court."
      },
      "below": {
        "ask": false
      },
      "reporter": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "not reported",
          "unreported",
          "generally not reported",
          "not published",
          "nothing",
          "no reporter"
        ],
        "canonical": "Generally not reported",
        "why": "Trial-court decisions are generally not published in a reporter — you cite to the record or docket instead. That is why nearly all reported, citable authority is appellate."
      },
      "note": "Trap check: do not reach into the federal system. The court above is in Arizona’s own ladder — a federal circuit court does not sit over a state trial court."
    },
    {
      "id": "c8",
      "court": "U.S. Court of Appeals for the Federal Circuit",
      "system": "Federal",
      "level": "advanced",
      "above": {
        "ask": true,
        "accept": [
          "supreme court of the united states",
          "us supreme court",
          "united states supreme court",
          "scotus",
          "supreme court"
        ],
        "canonical": "Supreme Court of the United States",
        "why": "Like every circuit, the Federal Circuit answers only to the Supreme Court of the United States."
      },
      "below": {
        "ask": false
      },
      "reporter": {
        "ask": true,
        "accept": [
          "federal reporter",
          "fed reporter",
          "f.4th",
          "f 4th",
          "f4th",
          "f.3d",
          "f 3d",
          "f3d",
          "f.2d",
          "f2d",
          "f."
        ],
        "canonical": "Federal Reporter (F.4th)",
        "why": "It is a U.S. Court of Appeals, so like the other circuits it publishes in the Federal Reporter (F.4th). Verify in Bluebook Table 1."
      },
      "note": "A geography trap. The Federal Circuit is defined by subject matter — patent cases, claims against the United States, international trade — not by a region. (The court for Washington, D.C., is the separate ‘D.C. Circuit.’)"
    },
    {
      "id": "c9",
      "court": "Supreme Court of California",
      "system": "California",
      "level": "advanced",
      "above": {
        "ask": true,
        "accept": [
          "none",
          "n/a",
          "na",
          "nothing",
          "no court",
          "highest",
          "highest court",
          "it is the highest",
          "this is the highest court",
          "top"
        ],
        "canonical": "None — it is California’s highest court",
        "why": "The Supreme Court of California is the top of the state system; only the U.S. Supreme Court, on federal questions, sits above it — and that is a different system."
      },
      "below": {
        "ask": true,
        "accept": [
          "california courts of appeal",
          "california court of appeal",
          "court of appeal",
          "courts of appeal",
          "ca court of appeal",
          "ca courts of appeal"
        ],
        "canonical": "California Courts of Appeal",
        "why": "The Courts of Appeal are the intermediate appellate courts directly below the Supreme Court of California."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "pacific reporter",
          "p.3d",
          "p 3d",
          "p3d",
          "p.2d",
          "p2d",
          "california reports",
          "cal.",
          "cal",
          "cal. 5th",
          "cal 5th"
        ],
        "canonical": "California Reports (Cal. 5th) — also Pacific Reporter (P.3d)",
        "why": "The California high court is published in the official California Reports (Cal. 5th) and the regional Pacific Reporter (P.3d). Confirm in Bluebook Table 1."
      }
    },
    {
      "id": "c10",
      "court": "Appellate Division of the Supreme Court",
      "system": "New York (read carefully)",
      "level": "advanced",
      "above": {
        "ask": true,
        "accept": [
          "new york court of appeals",
          "ny court of appeals",
          "court of appeals",
          "new york court of appeal",
          "court of appeals of new york",
          "new yorks court of appeals",
          "ny court of appeal"
        ],
        "canonical": "New York Court of Appeals",
        "why": "In New York the high court — above the Appellate Division — is the Court of Appeals, not the ‘Supreme Court.’"
      },
      "below": {
        "ask": true,
        "accept": [
          "new york supreme court",
          "ny supreme court",
          "supreme court",
          "new york supreme court trial"
        ],
        "canonical": "New York Supreme Court (the trial court)",
        "why": "Below the Appellate Division is the New York Supreme Court — which, confusingly, is the trial court."
      },
      "reporter": {
        "ask": true,
        "accept": [
          "appellate division reports",
          "a.d.3d",
          "ad3d",
          "a.d.",
          "ad",
          "a.d. 3d",
          "ad 3d",
          "new york supplement",
          "n.y.s.3d",
          "nys3d",
          "n.y.s.",
          "nys",
          "north eastern reporter",
          "n.e.3d",
          "ne3d"
        ],
        "canonical": "Appellate Division Reports (A.D.3d) — also New York Supplement (N.Y.S.3d)",
        "why": "The Appellate Division is published in the Appellate Division Reports (A.D.3d) and the New York Supplement (N.Y.S.3d). Verify in Bluebook Table 1."
      },
      "note": "The intermediate appellate court in New York — it sits between the trial-level ‘Supreme Court’ and the Court of Appeals."
    }
  ]
};

window.COMPANION = {
  "title": "Hierarchy of Authorities — Companion Notes",
  "intro": "Fill in each blank as you work through the module. Try to answer from memory first, then check yourself against the pages. When every blank is filled, this becomes your one-page guide to weighing authority.",
  "sections": [
    {
      "id": "hierarchy",
      "heading": "THE HIERARCHY OF AUTHORITY",
      "fields": [
        {
          "label": "The order, top to bottom (constitution → ... → local ordinances)"
        },
        {
          "label": "Statute vs. regulation — which outranks the other on the same subject"
        },
        {
          "label": "When federal law sits above state law (one word: the ____ Clause)"
        }
      ]
    },
    {
      "id": "primary-secondary",
      "heading": "PRIMARY VS. SECONDARY",
      "fields": [
        {
          "label": "Primary authority is"
        },
        {
          "label": "Secondary sources are (and three examples)"
        },
        {
          "label": "You usually START in ____ and END in ____"
        }
      ]
    },
    {
      "id": "binding",
      "heading": "THE BINDING TEST (for a case)",
      "fields": [
        {
          "label": "Question 1 — same ____?"
        },
        {
          "label": "Question 2 — from a ____ court in the ____ system?"
        },
        {
          "label": "Question 3 — is it on ____?"
        },
        {
          "label": "If any answer is no, the authority is"
        }
      ]
    },
    {
      "id": "statute-common",
      "heading": "STATUTE VS. COMMON LAW",
      "fields": [
        {
          "label": "On a subject a statute addresses, ____ controls over ____"
        },
        {
          "label": "Where no statute speaks, the rule comes from"
        },
        {
          "label": "A case interpreting a statute does NOT outrank it — instead it"
        }
      ]
    },
    {
      "id": "courts",
      "heading": "COURT LADDERS (fill from your Bluebook, Table 1)",
      "fields": [
        {
          "label": "Federal: trial → intermediate → highest"
        },
        {
          "label": "Arizona: trial → intermediate → highest"
        },
        {
          "label": "New York trap: the trial court is called ____; the highest is called ____"
        },
        {
          "label": "Advanced — the reporter each court publishes in (and: trial courts are usually ____)"
        }
      ]
    }
  ],
  "footer": "Tip: if you can fill this in without looking, you can rank any stack of authorities on sight."
};

window.PRACTICE = {
  "eyebrow": "Chapter 1 · Foundations of Legal Authority",
  "title": "Applying the Hierarchy",
  "intro": "Knowing the structure is half the job; the other half is using it under pressure. Three quick drills sharpen the core distinctions, the ranking exercise makes you order a full stack of authorities, and the courts exercise tests whether you can place any court in its system. Your work on every page is collected locally; come back here to download one submission file.",
  "nav": [
    {
      "page": "drill.html?type=primary-secondary",
      "kicker": "Drill",
      "label": "Primary vs. Secondary",
      "blurb": "Is it the law, or is it about the law? Rapid-fire calls on the distinction everything else builds on."
    },
    {
      "page": "drill.html?type=binding-persuasive",
      "kicker": "Drill",
      "label": "Binding vs. Persuasive",
      "blurb": "Same source, different courtrooms. Decide what binds and what merely persuades — and why the forum decides."
    },
    {
      "page": "drill.html?type=statute-common",
      "kicker": "Drill",
      "label": "Statute vs. Common Law",
      "blurb": "Who made the rule — the legislature or the courts — and which one governs when they meet."
    },
    {
      "page": "rank.html",
      "kicker": "Exercise",
      "label": "Rank the Authorities",
      "blurb": "A full stack of sources for one forum. Put them in controlling order and defend every placement."
    },
    {
      "page": "courts.html",
      "kicker": "Exercise",
      "label": "Courts & Reporters",
      "blurb": "Name the court above, the court below, and where its decisions are published — for the federal system and the states you’ll meet most."
    }
  ]
};

window.QUIZ = {
  "instructions": "Eight questions across the module — the hierarchy, primary vs. secondary, binding vs. persuasive, and statute vs. common law. Answer each; the feedback explains every option. Your score is collected locally for the practice page’s submission file.",
  "questions": [
    {
      "id": "q1",
      "topic": "hierarchy",
      "prompt": "An Arizona statute and a validly issued Arizona regulation on the same subject point in different directions. Which controls?",
      "options": [
        {
          "id": "a",
          "text": "The statute — a regulation draws its force from the statute and yields to it"
        },
        {
          "id": "b",
          "text": "The regulation — it is more recent and more specific"
        },
        {
          "id": "c",
          "text": "Whichever one the agency says controls"
        },
        {
          "id": "d",
          "text": "Neither — a court must break the tie case by case"
        }
      ],
      "correct": "a",
      "feedback": {
        "correct": "A regulation exists only because a statute empowered the agency to issue it — so when the two conflict, the enacted statute outranks the regulation it authorized.",
        "b": "Recency and specificity matter within a level of the hierarchy, not across levels — the regulation still draws its force from the statute above it.",
        "c": "The agency cannot rank its own rule above the legislature’s enactment; its power comes from that enactment.",
        "d": "There is no tie to break — the hierarchy already decides it: statute over regulation."
      }
    },
    {
      "id": "q2",
      "topic": "hierarchy",
      "prompt": "A statute is clear, but a litigant argues it violates the state constitution — and the state’s highest court agrees. Which authority wins?",
      "options": [
        {
          "id": "a",
          "text": "The statute — the legislature speaks for the people"
        },
        {
          "id": "b",
          "text": "The constitution — it sits above every statute in the hierarchy"
        },
        {
          "id": "c",
          "text": "The court’s opinion — courts outrank legislatures"
        },
        {
          "id": "d",
          "text": "They are equal, so the more recent one governs"
        }
      ],
      "correct": "b",
      "feedback": {
        "correct": "The constitution tops the hierarchy; a statute that violates it falls. The court’s opinion is the instrument — the constitution is the authority doing the work.",
        "a": "The legislature’s power itself comes from the constitution — it cannot enact past the document that created it.",
        "c": "The court does not outrank the legislature; it applied a higher law. Strike the constitutional argument and the statute would have stood.",
        "d": "Constitutional and statutory law are not equals — the whole point of the hierarchy is that one creates and limits the other."
      }
    },
    {
      "id": "q3",
      "topic": "primary-secondary",
      "prompt": "Which of these is primary authority?",
      "options": [
        {
          "id": "a",
          "text": "A treatise’s explanation of negligence doctrine"
        },
        {
          "id": "b",
          "text": "An ALR annotation collecting cases from forty states"
        },
        {
          "id": "c",
          "text": "A municipal ordinance regulating short-term rentals"
        },
        {
          "id": "d",
          "text": "A law review article proposing a new liability rule"
        }
      ],
      "correct": "c",
      "feedback": {
        "correct": "An ordinance is enacted law — the law itself, however local. Everything else on this list talks about the law: that is the whole distinction.",
        "a": "A treatise explains the law expertly — and is still secondary: about the law, never the law.",
        "b": "An ALR annotation collects and summarizes primary authority; the collection itself is secondary.",
        "d": "Scholarship analyzes and proposes — persuasive to read, secondary by definition."
      }
    },
    {
      "id": "q4",
      "topic": "primary-secondary",
      "prompt": "You found the perfect explanation of your rule in a legal encyclopedia. What belongs in your brief?",
      "options": [
        {
          "id": "a",
          "text": "A citation to the encyclopedia — it states the rule cleanly"
        },
        {
          "id": "b",
          "text": "The primary authority its footnotes led you to, after you read it"
        },
        {
          "id": "c",
          "text": "Both, side by side, for extra support"
        },
        {
          "id": "d",
          "text": "Neither — encyclopedias are unreliable"
        }
      ],
      "correct": "b",
      "feedback": {
        "correct": "The encyclopedia’s job was to hand you the citations. You follow them, read the primary authority, confirm it is still good law, and cite that.",
        "a": "With rare exceptions you do not cite secondary sources as the law — the encyclopedia is the map, not the territory.",
        "c": "Adding the encyclopedia next to on-point primary authority adds weakness, not weight.",
        "d": "Encyclopedias are reliable at their actual job — orientation and citations — just not as citable authority."
      }
    },
    {
      "id": "q5",
      "topic": "binding",
      "prompt": "Before an Arizona trial court: a California Supreme Court decision squarely on point. What is it?",
      "options": [
        {
          "id": "a",
          "text": "Binding — it is a state supreme court"
        },
        {
          "id": "b",
          "text": "Binding — it is squarely on point"
        },
        {
          "id": "c",
          "text": "Persuasive only — another jurisdiction’s law never binds an Arizona court"
        },
        {
          "id": "d",
          "text": "Nothing — out-of-state cases cannot even be cited"
        }
      ],
      "correct": "c",
      "feedback": {
        "correct": "Precedent runs down a single court system. California’s high court sits atop California’s system — in Arizona it can persuade, especially where Arizona law is unsettled, but it cannot bind.",
        "a": "Height in the wrong system is still the wrong system — bindingness follows the forum’s own ladder.",
        "b": "On-point makes it useful; it cannot make it binding across a jurisdictional line.",
        "d": "Too far — persuasive authority is citable and often valuable; it just is not controlling."
      }
    },
    {
      "id": "q6",
      "topic": "binding",
      "prompt": "The same published Ninth Circuit opinion is cited in two courts. Where does it bind?",
      "options": [
        {
          "id": "a",
          "text": "In every federal court, because it is a federal appellate decision"
        },
        {
          "id": "b",
          "text": "In a U.S. District Court within the Ninth Circuit — and only persuades a district court in the Second"
        },
        {
          "id": "c",
          "text": "Nowhere — only the Supreme Court binds"
        },
        {
          "id": "d",
          "text": "In both, if the reasoning is strong enough"
        }
      ],
      "correct": "b",
      "feedback": {
        "correct": "Exactly the both-and of authority: one case, binding inside its own circuit’s ladder, persuasive outside it. The forum decides which face you see.",
        "a": "Circuits bind their own district courts — sister circuits get persuasion, not obedience.",
        "c": "The Supreme Court binds everywhere, but each circuit binds within its own system too.",
        "d": "Strong reasoning increases persuasive force; it never converts persuasion into obligation."
      }
    },
    {
      "id": "q7",
      "topic": "statute-common-law",
      "prompt": "For decades, a state’s courts applied a common-law rule. The legislature then enacts a statute squarely addressing the question with a different rule. Going forward?",
      "options": [
        {
          "id": "a",
          "text": "The common-law rule — it is older and more developed"
        },
        {
          "id": "b",
          "text": "The statute — enacted law displaces the common law it addresses"
        },
        {
          "id": "c",
          "text": "Whichever a trial judge prefers"
        },
        {
          "id": "d",
          "text": "The common law, unless the statute says it overrides it"
        }
      ],
      "correct": "b",
      "feedback": {
        "correct": "Where a valid statute speaks to the question, it displaces the judge-made rule — the legislature can answer the courts back. The common law then governs only what the statute leaves open.",
        "a": "Age and development do not protect a common-law rule from a legislature that has spoken.",
        "c": "Judges apply the governing source; they do not choose between them by preference.",
        "d": "No magic words needed — a statute squarely addressing the question does the displacing by existing."
      }
    },
    {
      "id": "q8",
      "topic": "statute-common-law",
      "prompt": "On a question where the legislature has never enacted anything at all, where does the governing rule come from?",
      "options": [
        {
          "id": "a",
          "text": "There is no law until the legislature acts"
        },
        {
          "id": "b",
          "text": "The common law — the rules courts have developed case by case"
        },
        {
          "id": "c",
          "text": "Federal law fills every state-law gap"
        },
        {
          "id": "d",
          "text": "The restatement of the majority rule"
        }
      ],
      "correct": "b",
      "feedback": {
        "correct": "Where statutes are silent, the common law governs — judge-made rules built decision by decision. That is why case law research never stops mattering.",
        "a": "Courts have been resolving disputes — and making law doing it — for centuries of legislative silence.",
        "c": "Federal law governs federal questions; it does not backfill state common-law subjects.",
        "d": "A Restatement describes the common law persuasively — the governing rule is the forum’s own case law."
      }
    }
  ]
};

window.NAV = [
  {
    "id": "home",
    "label": "Home",
    "page": "index.html"
  },
  {
    "id": "hierarchy",
    "label": "The Hierarchy of Authority",
    "page": "hierarchy.html"
  },
  {
    "id": "quiz",
    "label": "Knowledge Check",
    "page": "quiz.html"
  },
  {
    "id": "practice",
    "label": "Applying the Hierarchy",
    "page": "practice.html"
  },
  {
    "id": "rank",
    "label": "Rank the Stack",
    "page": "rank.html"
  },
  {
    "id": "courts",
    "label": "Court Up / Court Down",
    "page": "courts.html"
  },
  {
    "id": "primary-secondary",
    "label": "Primary vs. Secondary",
    "page": "drill.html?type=primary-secondary"
  },
  {
    "id": "binding-persuasive",
    "label": "Binding vs. Persuasive",
    "page": "drill.html?type=binding-persuasive"
  },
  {
    "id": "statute-common",
    "label": "Statute vs. Common Law",
    "page": "drill.html?type=statute-common"
  }
];
