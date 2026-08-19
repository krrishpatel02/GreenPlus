from energy_formula import *


print("\n")
print("        🌱 GREENPLUS ENERGY ENGINE TEST")
# APPLIANCES
appliances = [

    {
        "name": "Air Conditioner",
        "power_watts": 1500,
        "hours_per_day": 6
    },

    {
        "name": "Refrigerator",
        "power_watts": 150,
        "hours_per_day": 10
    },

    {
        "name": "TV",
        "power_watts": 100,
        "hours_per_day": 4
    },

    {
        "name": "Ceiling Fan",
        "power_watts": 70,
        "hours_per_day": 8
    },

    {
        "name": "Lights",
        "power_watts": 60,
        "hours_per_day": 5
    },

    {
        "name": "Computer",
        "power_watts": 150,
        "hours_per_day": 5
    }
]
# EXAMPLE TARIFF
"""
IMPORTANT:

These are DEMONSTRATION values only.

Do NOT treat these as the current tariff of
any Indian state/DISCOM.

Later we will replace this with official
location-specific tariff configuration.
"""

slabs = [

    {
        "limit": 100,
        "rate": 3.0
    },

    {
        "limit": 200,
        "rate": 5.0
    },

    {
        "limit": 300,
        "rate": 7.0
    },

    {
        "limit": None,
        "rate": 8.5
    }
]
# COMPLETE ANALYSIS
result = complete_energy_analysis(

    appliances=appliances,

    solar_kwh=100,

    household_size=4,

    home_area_sqft=1200,

    slabs=slabs,

    fixed_charge=150,

    percentage_charges=5,

    additional_charges=0,

    rebate=0,

    emission_factor=0.7
)
# RESULTS
print("\n")
print("           ENERGY CONSUMPTION")
print(
    f"Total Energy      : "
    f"{result['total_energy_kwh']:.2f} kWh"
)

print(
    f"Solar Generation  : "
    f"{result['solar_kwh']:.2f} kWh"
)

print(
    f"Solar Contribution: "
    f"{result['solar_percentage']:.2f}%"
)

print(
    f"Grid Energy       : "
    f"{result['grid_energy_kwh']:.2f} kWh"
)


print("\n")
print("             BILL ANALYSIS")
print(
    f"Estimated Bill    : "
    f"₹{result['estimated_bill']:.2f}"
)

print(
    f"Bill / Person     : "
    f"₹{result['bill_per_person']:.2f}"
)


print("\n")
print("           CARBON ANALYSIS")
print(
    f"Carbon Emission   : "
    f"{result['carbon_kg_co2e']:.2f} kg CO₂e"
)


print("\n")
print("           EFFICIENCY ANALYSIS")
print(
    f"Energy / Person   : "
    f"{result['energy_per_person']:.2f} kWh"
)

print(
    f"Energy / sqft     : "
    f"{result['energy_intensity']:.4f} kWh"
)
# AC SAVING SIMULATION
print("\n")
print("        🌱 ENERGY SAVING SIMULATION")
saved_kwh = calculate_usage_saving(

    power_watts=1500,

    old_hours_per_day=6,

    new_hours_per_day=4
)


cost_saved = calculate_cost_saving(
    saved_kwh,
    average_rate=7
)


carbon_saved = calculate_carbon_saving(
    saved_kwh,
    emission_factor=0.7
)


print(
    f"\nAC usage reduction:"
)

print(
    "6 hours/day → 4 hours/day"
)

print(
    f"\nEnergy Saved  : "
    f"{saved_kwh:.2f} kWh/month"
)

print(
    f"Money Saved   : "
    f"₹{cost_saved:.2f}/month"
)

print(
    f"Carbon Saved  : "
    f"{carbon_saved:.2f} kg CO₂e/month"
)


print("\n")
print("       🌱 GREENPLUS ENERGY ENGINE READY")
