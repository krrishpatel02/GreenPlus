"""
        🌱 GREENPLUS ENERGY CALCULATOR
Combines:

    energy_formula.py
        ↓
    Physics / Energy calculations

    tariff.py
        ↓
    Electricity tariff / bill calculations

    ↓

    Complete household energy analysis

This is the deterministic foundation that we will later
use to generate the Energy ML dataset.
"""

from energy_formula import (
    appliance_energy,
    total_appliance_energy,
    solar_contribution,
    grid_energy,
    calculate_carbon_emission,
    energy_per_person,
    bill_per_person,
    energy_intensity_per_area,
    calculate_usage_saving,
    calculate_cost_saving,
    calculate_carbon_saving
)

from tariff import (
    calculate_bill,
    average_cost_per_kwh
)
# 1. COMPLETE HOUSEHOLD CALCULATOR
def calculate_household_energy(
    appliances,
    solar_kwh,
    household_size,
    home_area_sqft,
    tariff_id="demo_residential",
    emission_factor=0.7
):
    """
    Complete GreenPlus household energy calculation.

    Parameters
    appliances : list
        Household appliance information.

    solar_kwh : float
        Monthly solar generation.

    household_size : int
        Number of people in household.

    home_area_sqft : float
        Approximate home area.

    tariff_id : str
        Tariff configuration.

    emission_factor : float
        kg CO2e per kWh.

    Returns
    dict
        Complete energy analysis.
    """
    # VALIDATION
    if household_size <= 0:
        raise ValueError(
            "Household size must be greater than 0."
        )

    if home_area_sqft <= 0:
        raise ValueError(
            "Home area must be greater than 0."
        )

    if solar_kwh < 0:
        raise ValueError(
            "Solar generation cannot be negative."
        )
    # TOTAL ENERGY
    total_kwh = total_appliance_energy(
        appliances
    )
    # SOLAR
    solar_percent = solar_contribution(
        solar_kwh,
        total_kwh
    )
    # GRID ENERGY
    grid_kwh = grid_energy(
        total_kwh,
        solar_kwh
    )
    # ELECTRICITY BILL
    bill_data = calculate_bill(
        consumption_kwh=grid_kwh,
        tariff_id=tariff_id
    )

    total_bill = bill_data[
        "total_bill"
    ]
    # AVERAGE COST
    average_rate = average_cost_per_kwh(
        total_bill,
        grid_kwh
    )
    # CARBON
    carbon = calculate_carbon_emission(
        grid_kwh,
        emission_factor
    )
    # PER PERSON
    energy_person = energy_per_person(
        total_kwh,
        household_size
    )

    bill_person = bill_per_person(
        total_bill,
        household_size
    )
    # HOME ENERGY INTENSITY
    energy_intensity = energy_intensity_per_area(
        total_kwh,
        home_area_sqft
    )
    # RESULT
    return {

        # Energy
        "total_energy_kwh":
            round(total_kwh, 2),

        "solar_kwh":
            round(solar_kwh, 2),

        "solar_percentage":
            round(solar_percent, 2),

        "grid_energy_kwh":
            round(grid_kwh, 2),

        # Bill
        "energy_charge":
            round(
                bill_data["energy_charge"],
                2
            ),

        "fixed_charge":
            round(
                bill_data["fixed_charge"],
                2
            ),

        "additional_charge":
            round(
                bill_data["percentage_charge"],
                2
            ),

        "total_bill":
            round(total_bill, 2),

        "average_cost_per_kwh":
            round(average_rate, 2),

        # Carbon
        "carbon_kg_co2e":
            round(carbon, 2),

        # Household
        "energy_per_person":
            round(energy_person, 2),

        "bill_per_person":
            round(bill_person, 2),

        "energy_intensity":
            round(energy_intensity, 4),

        # Tariff information
        "tariff_id":
            bill_data["tariff_id"],

        "state":
            bill_data["state"],

        "discom":
            bill_data["discom"],

        "category":
            bill_data["category"],

        "tariff_source":
            bill_data["source"]
    }
# 2. APPLIANCE BREAKDOWN
def appliance_breakdown(
    appliances
):
    """
    Calculate individual appliance consumption.

    This is important for GreenPlus recommendations.

    Example:

        AC → 270 kWh
        Refrigerator → 45 kWh
        TV → 12 kWh
    """

    breakdown = []

    total = 0.0

    for appliance in appliances:

        energy = appliance_energy(
            appliance["power_watts"],
            appliance["hours_per_day"],
            appliance.get(
                "days_per_month",
                30
            )
        )

        total += energy

        breakdown.append({

            "name":
                appliance["name"],

            "power_watts":
                appliance["power_watts"],

            "hours_per_day":
                appliance["hours_per_day"],

            "monthly_kwh":
                round(
                    energy,
                    2
                )
        })

    # Add percentage contribution
    for item in breakdown:

        if total > 0:

            item[
                "percentage"
            ] = round(
                item["monthly_kwh"]
                / total
                * 100,
                2
            )

        else:

            item[
                "percentage"
            ] = 0

    return breakdown
# 3. FIND BIGGEST ENERGY CONSUMER
def biggest_energy_consumer(
    appliances
):
    """
    Identify the appliance consuming the most energy.
    """

    breakdown = appliance_breakdown(
        appliances
    )

    if not breakdown:
        return None

    biggest = max(
        breakdown,
        key=lambda x: x["monthly_kwh"]
    )

    return biggest
# 4. APPLIANCE SAVING SIMULATION
def simulate_appliance_reduction(
    power_watts,
    current_hours,
    new_hours,
    average_rate,
    emission_factor=0.7
):
    """
    Simulate reducing appliance usage.

    Example:

        AC:
        6 hours/day → 4 hours/day
    """

    saved_kwh = calculate_usage_saving(

        power_watts=power_watts,

        old_hours_per_day=current_hours,

        new_hours_per_day=new_hours
    )

    money_saved = calculate_cost_saving(
        saved_kwh,
        average_rate
    )

    carbon_saved = calculate_carbon_saving(
        saved_kwh,
        emission_factor
    )

    return {

        "energy_saved_kwh":
            round(saved_kwh, 2),

        "money_saved":
            round(money_saved, 2),

        "carbon_saved_kg":
            round(carbon_saved, 2)
    }
# 5. ENERGY LEVEL
def classify_energy_usage(
    energy_per_person_value
):
    """
    Basic classification.

    These are starting thresholds only.
    Later we can replace them with data-driven
    ML-based classification.

    Returns:

        Low
        Moderate
        High
        Very High
    """

    if energy_per_person_value < 75:

        return "Low"

    elif energy_per_person_value < 150:

        return "Moderate"

    elif energy_per_person_value < 250:

        return "High"

    else:

        return "Very High"
# 6. SOLAR STATUS
def solar_status(
    solar_percentage
):
    """
    Classify solar contribution.
    """

    if solar_percentage <= 0:

        return "No Solar"

    elif solar_percentage < 20:

        return "Low Solar Contribution"

    elif solar_percentage < 50:

        return "Moderate Solar Contribution"

    else:

        return "High Solar Contribution"
# 7. COMPLETE GREENPLUS ANALYSIS
def greenplus_energy_analysis(
    appliances,
    solar_kwh,
    household_size,
    home_area_sqft,
    tariff_id="demo_residential",
    emission_factor=0.7
):
    """
    High-level GreenPlus Energy Analysis.

    Combines:

        Energy
        Bill
        Carbon
        Appliance breakdown
        Energy classification
        Solar classification
    """

    # Main calculation
    analysis = calculate_household_energy(

        appliances=appliances,

        solar_kwh=solar_kwh,

        household_size=household_size,

        home_area_sqft=home_area_sqft,

        tariff_id=tariff_id,

        emission_factor=emission_factor
    )

    # Appliance breakdown
    breakdown = appliance_breakdown(
        appliances
    )

    # Biggest consumer
    biggest = biggest_energy_consumer(
        appliances
    )

    # Energy classification
    energy_level = classify_energy_usage(
        analysis["energy_per_person"]
    )

    # Solar classification
    solar_level = solar_status(
        analysis["solar_percentage"]
    )

    # Add advanced information
    analysis["appliance_breakdown"] = breakdown

    analysis["biggest_consumer"] = biggest

    analysis["energy_level"] = energy_level

    analysis["solar_status"] = solar_level

    return analysis
# END
