from energy_calculator import (
    greenplus_energy_analysis,
    simulate_appliance_reduction
)


print("\n")
print("             🌱 GREENPLUS ENERGY AI")
# USER HOUSEHOLD
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
        "name": "Television",
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
# COMPLETE ANALYSIS
result = greenplus_energy_analysis(

    appliances=appliances,

    solar_kwh=100,

    household_size=4,

    home_area_sqft=1200,

    tariff_id="demo_residential",

    emission_factor=0.7
)
# MAIN RESULT
print("\n")
print("             ENERGY SUMMARY")
print(
    f"Total Energy      : "
    f"{result['total_energy_kwh']:.2f} kWh"
)

print(
    f"Solar             : "
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
# BILL
print("\n")
print("              BILL SUMMARY")
print(
    f"Energy Charge : "
    f"₹{result['energy_charge']:.2f}"
)

print(
    f"Fixed Charge  : "
    f"₹{result['fixed_charge']:.2f}"
)

print(
    f"Other Charge  : "
    f"₹{result['additional_charge']:.2f}"
)

print(
    f"Total Bill    : "
    f"₹{result['total_bill']:.2f}"
)

print(
    f"Average Rate  : "
    f"₹{result['average_cost_per_kwh']:.2f}/kWh"
)
# CARBON
print("\n")
print("             CARBON SUMMARY")
print(
    f"Carbon Emission : "
    f"{result['carbon_kg_co2e']:.2f} kg CO₂e"
)
# HOUSEHOLD
print("\n")
print("           HOUSEHOLD ANALYSIS")
print(
    f"Energy / Person : "
    f"{result['energy_per_person']:.2f} kWh"
)

print(
    f"Bill / Person   : "
    f"₹{result['bill_per_person']:.2f}"
)

print(
    f"Energy / sqft   : "
    f"{result['energy_intensity']:.4f} kWh"
)

print(
    f"Energy Level    : "
    f"{result['energy_level']}"
)

print(
    f"Solar Status    : "
    f"{result['solar_status']}"
)
# APPLIANCE BREAKDOWN
print("\n")
print("           APPLIANCE BREAKDOWN")
for appliance in result[
    "appliance_breakdown"
]:

    print(
        f"{appliance['name']:<20}"
        f"{appliance['monthly_kwh']:>8.2f} kWh"
        f"   {appliance['percentage']:>6.2f}%"
    )
# BIGGEST CONSUMER
print("\n")
print("          BIGGEST ENERGY CONSUMER")
biggest = result[
    "biggest_consumer"
]

if biggest:

    print(
        f"Appliance : "
        f"{biggest['name']}"
    )

    print(
        f"Usage     : "
        f"{biggest['monthly_kwh']:.2f} kWh/month"
    )

    print(
        f"Share     : "
        f"{biggest['percentage']:.2f}%"
    )
# SAVING SIMULATION
print("\n")
print("           🌱 SAVING SIMULATION")
saving = simulate_appliance_reduction(

    power_watts=1500,

    current_hours=6,

    new_hours=4,

    average_rate=result[
        "average_cost_per_kwh"
    ],

    emission_factor=0.7
)


print("\nAC Usage:")
print("6 hours/day → 4 hours/day")

print(
    f"\nEnergy Saved : "
    f"{saving['energy_saved_kwh']:.2f} kWh/month"
)

print(
    f"Money Saved  : "
    f"₹{saving['money_saved']:.2f}/month"
)

print(
    f"Carbon Saved : "
    f"{saving['carbon_saved_kg']:.2f} kg CO₂e/month"
)


print("\n")
print("        🌱 GREENPLUS ENERGY ENGINE READY")
