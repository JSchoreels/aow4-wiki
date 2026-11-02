/* Numeric values and names verified against installed game resources. */
window.AOW4_RITES = {
  "checked": "2026-11-02",
  "steamBuild": "25750198",
  "descriptionSource": {
    "repository": "MinionsArt/aow4db Data/EN/EmpireProgression.json",
    "blob": "293a826c338388afd6a6e919d60e79b72dcfe4ac"
  },
  "sourceFiles": [
    {
      "path": "Content/Title/Packs/Definitions/EmpireProgression_Definition.rpk",
      "sha256": "f505e050d4406d235930b543d887971d57b507474ee325aa912f660d87bfa109"
    },
    {
      "path": "Language/EN/EN.MO",
      "sha256": "3f7d7494e853098947d017416e4763434956fea54e8697e9b4e76ed34a93fb23"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Tree.rpk",
      "sha256": "0b7619e43a6fedfa17d42864d0d04914d7acc28ec45322dc45d7f5fac8152563"
    },
    {
      "path": "Content/Title/Packs/Research/Core_Empire_Development.rpk",
      "sha256": "b8a1533a58641fe4588edfe7b27d42473ffdb6d7fd862e8cefefae4c56fc7acd"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Nature.rpk",
      "sha256": "45fec6456a02f0ac328a0da224f30d30ac70e6d958f32971b8fffd5103a1f95d"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Chaos.rpk",
      "sha256": "4e198a51a39f969eb97c0ead8529f92bdd9b66639d8d55bf66e321bb9896782e"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Astral.rpk",
      "sha256": "2db451d47672cefcccf620205ac5d2ce4f78f39ab0c98fba3862362ebf19a751"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Materium.rpk",
      "sha256": "3a689aa28ce7da672b5f3d1fd51145d780669abd17d608fc9e0afb4a15ddb416"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Order.rpk",
      "sha256": "c22e9312d819959de662cd65c9a5b8dc7adef5f28bd0424ba0e99c803ae2f07a"
    },
    {
      "path": "Content/Title/Packs/Research/EmpireProgression_Shadow.rpk",
      "sha256": "c58946d89d8909e20d3c51b5b45264bacd6b11ecc24b7fac9f10d628945b878e"
    }
  ],
  "rites": [
    {
      "id": "expanded_governance",
      "name": "Expanded Governance",
      "affinity": "General",
      "level": 4,
      "icon": "000003E100001803",
      "effect": "Increase the <hyperlink>City Cap</hyperlink> by +1<citytier></citytier>.",
      "initialCost": 200,
      "costIncrease": 300,
      "unlockAffinity": 100,
      "rechargeAffinity": 0,
      "rechargeIncrease": 0,
      "resourceId": "0000042B00000211",
      "package": "Content/Title/Packs/Research/Core_Empire_Development.rpk",
      "costResourceId": "0000045E000008CA",
      "repeatResourceId": "0000048B00000F91",
      "evidence": {
        "costOffset": 2229,
        "incrementOffset": 2937
      }
    },
    {
      "id": "rite_of_the_last_stand",
      "name": "Rite of the Last Stand",
      "affinity": "General",
      "level": 5,
      "icon": "000003E100001DB0",
      "effect": "Each city in your Empire loses -1 <population></population> <hyperlink>Population</hyperlink>, but immediately summons 3 <hyperlink>Tier</hyperlink> I <hyperlink>Units</hyperlink>.",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 120,
      "rechargeAffinity": 120,
      "rechargeIncrease": 50,
      "resourceId": "000003E100001DAF",
      "package": "Content/Title/Packs/Research/Core_Empire_Development.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_expansive_growth",
      "name": "Rite of Expansive Growth",
      "affinity": "Nature",
      "level": 6,
      "icon": "0000048B00000F8E",
      "effect": "Increase the <hyperlink>City Cap</hyperlink> by +1<citytier></citytier>.",
      "initialCost": 250,
      "costIncrease": 50,
      "unlockAffinity": 160,
      "rechargeAffinity": 160,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00000F90",
      "package": "Content/Title/Packs/Research/EmpireProgression_Nature.rpk",
      "costResourceId": "000003E100001CFA",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1404,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_awakening",
      "name": "Rite of Awakening",
      "affinity": "Nature",
      "level": 8,
      "icon": "0000048B00000FA4",
      "effect": "Instantly gain 15<knowledge></knowledge> <hyperlink>Knowledge</hyperlink>, 15<mana></mana> <hyperlink>Mana</hyperlink>, and 15<gold></gold> <hyperlink>Gold</hyperlink> for each <population></population> <hyperlink>Population</hyperlink> in your empire's <hyperlink>Cities</hyperlink>.",
      "initialCost": 350,
      "costIncrease": 50,
      "unlockAffinity": 300,
      "rechargeAffinity": 300,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00000FA3",
      "package": "Content/Title/Packs/Research/EmpireProgression_Nature.rpk",
      "costResourceId": "000003E100001CFC",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1730,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_natures_guardians",
      "name": "Rite of Nature's Guardians",
      "affinity": "Nature",
      "level": 9,
      "icon": "0000048B00000FAA",
      "effect": "Immediately summon a <hyperlink>White Wolf</hyperlink> with Resurgence and Animal Guardian and an <hyperlink>Entwined Scourge</hyperlink> with Resurgence and Plant Guardian in your <hyperlink>Throne City</hyperlink>.",
      "initialCost": 400,
      "costIncrease": 50,
      "unlockAffinity": 400,
      "rechargeAffinity": 400,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00000FA9",
      "package": "Content/Title/Packs/Research/EmpireProgression_Nature.rpk",
      "costResourceId": "000003E100001CFD",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1893,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_war",
      "name": "Rite of War",
      "affinity": "Chaos",
      "level": 4,
      "icon": "0000048B00000FD9",
      "effect": "All your <hyperlink>Cities</hyperlink> immediately gain 400<unitprod></unitprod> <hyperlink>Draft</hyperlink>.",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 100,
      "rechargeAffinity": 100,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00000FDA",
      "package": "Content/Title/Packs/Research/EmpireProgression_Chaos.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_chosen_warriors",
      "name": "Rite of Chosen Warriors",
      "affinity": "Chaos",
      "level": 6,
      "icon": "0000048B00000FEA",
      "effect": "Your <hyperlink>Units</hyperlink> all immediately gain enough <hyperlink><xp></xp> Experience</hyperlink> to level up.<br></br><br></br>Does not affect <hyperlink>Heroes</hyperlink> and units above <medalPlatinum></medalPlatinum>Legendary rank.",
      "initialCost": 250,
      "costIncrease": 50,
      "unlockAffinity": 160,
      "rechargeAffinity": 160,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00000FE9",
      "package": "Content/Title/Packs/Research/EmpireProgression_Chaos.rpk",
      "costResourceId": "000003E100001CFA",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1404,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_fanaticism",
      "name": "Rite of Fanaticism",
      "affinity": "Chaos",
      "level": 10,
      "icon": "0000048B00001055",
      "effect": "All of your <hyperlink>Units</hyperlink> gain the following for 5 <turn></turn> <hyperlink>Turns</hyperlink>:<bulletlist><bullet>Resurgence</bullet><bullet>Martyr</bullet></bulletlist>",
      "initialCost": 500,
      "costIncrease": 50,
      "unlockAffinity": 500,
      "rechargeAffinity": 500,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00001054",
      "package": "Content/Title/Packs/Research/EmpireProgression_Chaos.rpk",
      "costResourceId": "000003E100001CFE",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 2057,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_astral_abundance",
      "name": "Rite of Astral Abundance",
      "affinity": "Astral",
      "level": 4,
      "icon": "0000048B0000116B",
      "effect": "Instantly gain 750 <mana></mana> <hyperlink>Mana</hyperlink>.",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 100,
      "rechargeAffinity": 100,
      "rechargeIncrease": 50,
      "resourceId": "0000048B0000116A",
      "package": "Content/Title/Packs/Research/EmpireProgression_Astral.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_conjuration",
      "name": "Rite of Conjuration",
      "affinity": "Astral",
      "level": 6,
      "icon": "0000048B000011A0",
      "effect": "Create a random <hyperlink>Magic Material</hyperlink> near your <hyperlink>Throne City</hyperlink>.",
      "initialCost": 250,
      "costIncrease": 50,
      "unlockAffinity": 160,
      "rechargeAffinity": 160,
      "rechargeIncrease": 50,
      "resourceId": "0000048B0000119F",
      "package": "Content/Title/Packs/Research/EmpireProgression_Astral.rpk",
      "costResourceId": "000003E100001CFA",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1404,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_spell_storm",
      "name": "Rite of Spell Storm",
      "affinity": "Astral",
      "level": 8,
      "icon": "0000048B00001183",
      "effect": "Gain 150 <caststrategic></caststrategic> <hyperlink>World Map Casting Points</hyperlink> and <optactical></optactical> <hyperlink> Combat Casting Points</hyperlink> until the end of the turn.",
      "initialCost": 350,
      "costIncrease": 50,
      "unlockAffinity": 300,
      "rechargeAffinity": 300,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00001182",
      "package": "Content/Title/Packs/Research/EmpireProgression_Astral.rpk",
      "costResourceId": "000003E100001CFC",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1730,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_the_armorer",
      "name": "Rite of the Armorer",
      "affinity": "Materium",
      "level": 4,
      "icon": "0000048B0000108A",
      "effect": "Immediately gain 500<bindingessence></bindingessence> <hyperlink>Binding Essence</hyperlink> and 250<bindingfragments></bindingfragments> <hyperlink>Binding Fragments</hyperlink>",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 100,
      "rechargeAffinity": 100,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00001089",
      "package": "Content/Title/Packs/Research/EmpireProgression_Materium.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_industry",
      "name": "Rite of Industry",
      "affinity": "Materium",
      "level": 7,
      "icon": "0000048B000010A9",
      "effect": "All of your <hyperlink>Cities</hyperlink> immediately gain 500 <structureprod></structureprod> <hyperlink>Production</hyperlink>.",
      "initialCost": 300,
      "costIncrease": 50,
      "unlockAffinity": 200,
      "rechargeAffinity": 200,
      "rechargeIncrease": 50,
      "resourceId": "0000048B000010A8",
      "package": "Content/Title/Packs/Research/EmpireProgression_Materium.rpk",
      "costResourceId": "000003E100001CFB",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1567,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_stoic_defense",
      "name": "Rite of Stoic Defense",
      "affinity": "Materium",
      "level": 8,
      "icon": "0000048B000010B2",
      "effect": "All of your current <hyperlink>Units</hyperlink>:<bulletlist><bullet>Heal to their maximum <hyperlink><hp></hp> Hit Points</hyperlink>.</bullet><bullet>Gain +1 <defense></defense> <hyperlink>Defense</hyperlink> and +1 <resistance></resistance> <hyperlink>Resistance</hyperlink>, which does not stack with subsequent uses.</bullet></bulletlist>",
      "initialCost": 350,
      "costIncrease": 50,
      "unlockAffinity": 300,
      "rechargeAffinity": 300,
      "rechargeIncrease": 50,
      "resourceId": "0000048B000010B1",
      "package": "Content/Title/Packs/Research/EmpireProgression_Materium.rpk",
      "costResourceId": "000003E100001CFC",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1730,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_allegiance",
      "name": "Rite of Allegiance",
      "affinity": "Order",
      "level": 4,
      "icon": "0000048B0000121C",
      "effect": "Instantly gain 20 <hyperlink><allegiance></allegiance>Allegiance</hyperlink> with all non-hostile <minorcity></minorcity><hyperlink>Free Cities</hyperlink>.",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 100,
      "rechargeAffinity": 100,
      "rechargeIncrease": 50,
      "resourceId": "0000048B0000121B",
      "package": "Content/Title/Packs/Research/EmpireProgression_Order.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_wealth",
      "name": "Rite of Wealth",
      "affinity": "Order",
      "level": 7,
      "icon": "0000048B00001237",
      "effect": "Instantly gain 2000 <gold></gold> <hyperlink>Gold</hyperlink>.",
      "initialCost": 300,
      "costIncrease": 50,
      "unlockAffinity": 200,
      "rechargeAffinity": 200,
      "rechargeIncrease": 50,
      "resourceId": "0000048B00001236",
      "package": "Content/Title/Packs/Research/EmpireProgression_Order.rpk",
      "costResourceId": "000003E100001CFB",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1567,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_the_banners",
      "name": "Rite of the Banners",
      "affinity": "Order",
      "level": 10,
      "icon": "0000048B0000125B",
      "effect": "Call a <hyperlink>Rally of the Lieges</hyperlink> event, where you have 20 additional <recruitmentPoints></recruitmentPoints> <hyperlink>Recruitment Points</hyperlink>.",
      "initialCost": 500,
      "costIncrease": 50,
      "unlockAffinity": 500,
      "rechargeAffinity": 500,
      "rechargeIncrease": 50,
      "resourceId": "0000048B0000125A",
      "package": "Content/Title/Packs/Research/EmpireProgression_Order.rpk",
      "costResourceId": "000003E100001CFE",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 2057,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_forbidden_knowledge",
      "name": "Rite of Forbidden Knowledge",
      "affinity": "Shadow",
      "level": 4,
      "icon": "0000048B000012CA",
      "effect": "Instantly gain 400 <knowledge></knowledge> <hyperlink>Knowledge</hyperlink>.",
      "initialCost": 175,
      "costIncrease": 50,
      "unlockAffinity": 100,
      "rechargeAffinity": 100,
      "rechargeIncrease": 50,
      "resourceId": "0000048B000012C9",
      "package": "Content/Title/Packs/Research/EmpireProgression_Shadow.rpk",
      "costResourceId": "000003E100001CF7",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1078,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_the_exalted",
      "name": "Rite of the Exalted",
      "affinity": "Shadow",
      "level": 6,
      "icon": "0000048B000012B3",
      "effect": "All your <hyperlink>Heroes</hyperlink> instantly gain +1 Rank.",
      "initialCost": 250,
      "costIncrease": 50,
      "unlockAffinity": 160,
      "rechargeAffinity": 160,
      "rechargeIncrease": 50,
      "resourceId": "0000048B000012B2",
      "package": "Content/Title/Packs/Research/EmpireProgression_Shadow.rpk",
      "costResourceId": "000003E100001CFA",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1404,
        "incrementOffset": 2759
      }
    },
    {
      "id": "rite_of_swift_shadows",
      "name": "Rite of Swift Shadows",
      "affinity": "Shadow",
      "level": 8,
      "icon": "0000048B000012DA",
      "effect": "Your <hyperlink>Units</hyperlink> immediately regain all of their <movementgeneral></movementgeneral> <hyperlink>Move Points</hyperlink> and gain Universal Camouflage for 2 <turn></turn> <hyperlink>Turns</hyperlink>.",
      "initialCost": 350,
      "costIncrease": 50,
      "unlockAffinity": 300,
      "rechargeAffinity": 300,
      "rechargeIncrease": 50,
      "resourceId": "0000048B000012D9",
      "package": "Content/Title/Packs/Research/EmpireProgression_Shadow.rpk",
      "costResourceId": "000003E100001CFC",
      "repeatResourceId": "0000048B00000FA8",
      "evidence": {
        "costOffset": 1730,
        "incrementOffset": 2759
      }
    }
  ]
};
