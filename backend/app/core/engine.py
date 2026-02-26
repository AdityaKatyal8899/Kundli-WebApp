import swisseph as swe
from typing import Dict, Tuple

SIGN_LORDS = {
    1: "Mars", 2: "Venus", 3: "Merc", 4: "Moon",
    5: "Sun", 6: "Merc", 7: "Venus", 8: "Mars",
    9: "Jup", 10: "Sat", 11: "Sat", 12: "Jup"
}

FRIENDS = {
    "Sun": {"Sun": 2, "Moon": 2, "Mars": 2, "Merc": 1, "Jup": 2, "Venus": 0, "Sat": 0},
    "Moon": {"Sun": 2, "Moon": 2, "Mars": 1, "Merc": 2, "Jup": 1, "Venus": 1, "Sat": 1},
    "Mars": {"Sun": 2, "Moon": 2, "Mars": 2, "Merc": 0, "Jup": 2, "Venus": 1, "Sat": 1},
    "Merc": {"Sun": 2, "Moon": 0, "Mars": 1, "Merc": 2, "Jup": 1, "Venus": 2, "Sat": 1},
    "Jup": {"Sun": 2, "Moon": 2, "Mars": 2, "Merc": 0, "Jup": 2, "Venus": 0, "Sat": 1},
    "Venus": {"Sun": 0, "Moon": 0, "Mars": 1, "Merc": 2, "Jup": 1, "Venus": 2, "Sat": 2},
    "Sat": {"Sun": 0, "Moon": 0, "Mars": 0, "Merc": 2, "Jup": 1, "Venus": 2, "Sat": 2}
}

# (Gana, Nadi, Yoni)
NAK_PROPS = [
    (0,0,0), (1,1,1), (2,2,1), (0,1,2), (1,0,2), (2,0,3), (0,0,3),
    (0,1,4), (2,2,4), (2,0,5), (1,1,5), (1,2,6), (0,2,6),
    (2,1,7), (0,0,7), (2,1,8), (0,1,8), (2,2,9),
    (2,0,9), (1,1,10), (1,2,10), (0,2,11),
    (2,1,11), (2,0,12), (1,1,12), (1,2,13), (0,2,13)
]



class KundliEngine:
    """
    Core engine for astrology calculations and chart matching.
    Future purpose: Integrate library like Swiss Ephemeris for planet positions
    and implement traditional Ashtakoota matching logic.
    """

    @staticmethod
    def generate_chart(birth_data: Dict) -> Dict: 
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        iflag = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

        jd = swe.julday(
            birth_data["year"],
            birth_data["month"],
            birth_data["day"],
            birth_data["hour"]
        )

        # Ascendant
        _, ascmc = swe.houses_ex(jd, birth_data["lat"], birth_data["lon"], b'W')
        asc_sign = int((ascmc[0] % 360) / 30) + 1

        # Planets to calculate
        planets_to_calc = {
            "Sun": swe.SUN,
            "Moon": swe.MOON,
            "Mars": swe.MARS,
            "Merc": swe.MERCURY,
            "Jup": swe.JUPITER,
            "Venus": swe.VENUS,
            "Sat": swe.SATURN,
            "Rahu": swe.MEAN_NODE
        }

        planet_positions = {}
        for name, pid in planets_to_calc.items():
            res, _ = swe.calc_ut(jd, pid, iflag)
            lon = res[0] % 360
            sign = int(lon / 30) + 1
            planet_positions[name] = {"lon": lon, "sign": sign}
        
        # Add Ketu (Rahu + 180)
        rahu_lon = planet_positions["Rahu"]["lon"]
        ketu_lon = (rahu_lon + 180) % 360
        planet_positions["Ketu"] = {"lon": ketu_lon, "sign": int(ketu_lon / 30) + 1}

        # House Mapping
        # house = (planet_sign - asc_sign + 12) % 12 + 1
        houses = {}
        for h_num in range(1, 13):
            # house_sign = (asc_sign + house_num - 2) % 12 + 1
            h_sign = (asc_sign + h_num - 2) % 12 + 1
            houses[h_num] = {"sign": h_sign, "planets": []}

        for p_name, p_data in planet_positions.items():
            p_house = (p_data["sign"] - asc_sign + 12) % 12 + 1
            houses[p_house]["planets"].append(p_name)

        # Basic properties for compatibility
        moon_lon = planet_positions["Moon"]["lon"]
        nak_idx = int(moon_lon / (360 / 27))
        nak_idx = min(nak_idx, 26)
        gana, nadi, yoni = NAK_PROPS[nak_idx]
        
        mars_house = (planet_positions["Mars"]["sign"] - asc_sign + 12) % 12 + 1
        is_manglik = mars_house in [1, 2, 4, 7, 8, 12]

        return {
            "asc_sign": asc_sign,
            "moon_sign": planet_positions["Moon"]["sign"],
            "nakshatra_index": nak_idx,
            "gana": gana,
            "nadi": nadi,
            "yoni": yoni,
            "is_manglik": is_manglik,
            "houses": houses,
            "planet_positions": planet_positions
        }


    @staticmethod
    def match_charts(chart1: Dict, chart2: Dict) -> Dict:
        result = {}

        # 1. Varna (1)
        def v_rank(s):
            return 4 if s in [4,8,12] else \
                   3 if s in [1,5,9] else \
                   2 if s in [2,6,10] else 1

        result['varna'] = 1 if v_rank(chart1["moon_sign"]) >= v_rank(chart2["moon_sign"]) else 0

        # 2. Vashya (2)
        result['vashya'] = 2 if chart1["moon_sign"] == chart2["moon_sign"] else 1

        # 3. Tara (3)
        t1 = ((chart2["nakshatra_index"] - chart1["nakshatra_index"] + 27) % 27 + 1) % 9
        t2 = ((chart1["nakshatra_index"] - chart2["nakshatra_index"] + 27) % 27 + 1) % 9
        result['tara'] = (
            (1.5 if t1 in [0,1,2,4,6,8] else 0) +
            (1.5 if t2 in [0,1,2,4,6,8] else 0)
        )

        # 4. Yoni (4)
        result['yoni'] = 4 if chart1["yoni"] == chart2["yoni"] else 2

        # 5. Maitri (5)
        l1 = SIGN_LORDS[chart1["moon_sign"]]
        l2 = SIGN_LORDS[chart2["moon_sign"]]
        f_score = FRIENDS[l1][l2] + FRIENDS[l2][l1]
        result['maitri'] = (
            5 if f_score == 4 else
            4 if f_score == 3 else
            1 if f_score == 2 else 0
        )

        # 6. Gana (6)
        if chart1["gana"] == chart2["gana"]:
            result['gana'] = 6
        elif chart1["gana"] == 2 or chart2["gana"] == 2:
            result['gana'] = 0
        else:
            result['gana'] = 5

        # 7. Bhakoot (7)
        dist = (chart2["moon_sign"] - chart1["moon_sign"] + 12) % 12
        result['bhakoot'] = 0 if dist in [2, 5, 6, 7, 8, 12] and dist != 0 else 7

        # 8. Nadi (8)
        result['nadi'] = 8 if chart1["nadi"] != chart2["nadi"] else 0

        total_score = sum(result.values())
        manglik_status = "Balanced" if chart1["is_manglik"] == chart2["is_manglik"] else "Mismatch"

        return {
            "total_score": total_score,
            "max_score": 36,
            "breakdown": result,
            "manglik_status": manglik_status
        }
