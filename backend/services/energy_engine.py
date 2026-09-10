import sys

from ..config import ROOT_DIR


_energy_analysis = None


def analyze(payload, number):
    global _energy_analysis
    if _energy_analysis is None:
        energy_dir = str(ROOT_DIR / "ai" / "energy")
        if energy_dir not in sys.path:
            sys.path.insert(0, energy_dir)
        from energy_calculator import greenplus_energy_analysis

        _energy_analysis = greenplus_energy_analysis

    return _energy_analysis(
        appliances=payload["appliances"],
        solar_kwh=number(payload, "solar_kwh", 0, minimum=0),
        household_size=number(payload, "household_size", integer=True, minimum=1),
        home_area_sqft=number(payload, "home_area_sqft", minimum=1),
        tariff_id=payload.get("tariff_id", "demo_residential"),
        emission_factor=number(payload, "emission_factor", 0.7, minimum=0),
    )
