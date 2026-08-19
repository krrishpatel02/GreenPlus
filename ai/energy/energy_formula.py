"""
GREENPLUS ENERGY ENGINE
Physics + Mathematics based Energy Calculator

This module calculates:
    - Appliance energy consumption
    - Total household electricity
    - Solar contribution
    - Grid electricity
    - Electricity bill
    - Carbon emissions
    - Energy per person
    - Potential savings

IMPORTANT:
Tariff values are configuration inputs.
They should eventually come from the user's detected
location/DISCOM and current official tariff schedule.
"""
# 1. APPLIANCE ENERGY
def appliance_energy(
    power_watts,
    hours_per_day,
    days_per_month=30
):
    """
    Calculate monthly energy consumption.

    Formula:

        Energy(kWh) =
        Power(kW) × Hours × Days

    Example:
        1500 W AC
        6 hours/day
        30 days

        = 1.5 × 6 × 30
        = 270 kWh
    """

    power_kw = power_watts / 1000

    energy_kwh = (
        power_kw
        * hours_per_day
        * days_per_month
    )

    return energy_kwh
# 2. APPLIANCE ENERGY WITH EFFICIENCY
def appliance_energy_adjusted(
    power_watts,
    hours_per_day,
    efficiency=1.0,
    days_per_month=30
):
    """
    Calculate energy while accounting for an efficiency factor.

    efficiency:
        1.0 = 100%
        0.8 = 80%

    For normal appliances use 1.0 unless we have
    a reliable efficiency value.
    """

    if efficiency <= 0:
        raise ValueError(
            "Efficiency must be greater than 0."
        )

    base_energy = appliance_energy(
        power_watts,
        hours_per_day,
        days_per_month
    )

    return base_energy / efficiency
# 3. TOTAL APPLIANCE ENERGY
def total_appliance_energy(
    appliances
):
    """
    Calculate total monthly energy from appliances.

    Expected format:

    appliances = [
        {
            "name": "AC",
            "power_watts": 1500,
            "hours_per_day": 6
        },
        ...
    ]
    """

    total = 0.0

    for appliance in appliances:

        energy = appliance_energy(
            appliance["power_watts"],
            appliance["hours_per_day"],
            appliance.get("days_per_month", 30)
        )

        total += energy

    return total
# 4. SOLAR CONTRIBUTION
def solar_contribution(
    solar_kwh,
    total_energy_kwh
):
    """
    Calculate percentage of electricity demand
    supplied by solar.

    Formula:

        Solar % =
        Solar Generation / Total Consumption × 100
    """

    if total_energy_kwh <= 0:
        return 0.0

    percentage = (
        solar_kwh
        / total_energy_kwh
        * 100
    )

    return min(
        max(percentage, 0),
        100
    )
# 5. GRID ELECTRICITY
def grid_energy(
    total_energy_kwh,
    solar_kwh
):
    """
    Calculate electricity required from the grid.

    Formula:

        Grid Energy =
        Total Energy - Solar Energy
    """

    grid = (
        total_energy_kwh
        - solar_kwh
    )

    return max(
        grid,
        0
    )
# 6. SLAB BASED ENERGY CHARGE
def calculate_slab_charge(
    consumption_kwh,
    slabs
):
    """
    Calculate energy charge using progressive slabs.

    Example:

    slabs = [
        {"limit": 100, "rate": 3.0},
        {"limit": 200, "rate": 5.0},
        {"limit": None, "rate": 7.0}
    ]

    This means:

        First 100 kWh  → ₹3
        Next 100 kWh   → ₹5
        Above 200 kWh  → ₹7

    'limit' represents the upper limit of that slab.
    None means unlimited.
    """

    if consumption_kwh <= 0:
        return 0.0

    remaining = consumption_kwh
    previous_limit = 0
    charge = 0.0

    for slab in slabs:

        limit = slab["limit"]
        rate = slab["rate"]

        if limit is None:

            units = remaining

        else:

            slab_units = (
                limit
                - previous_limit
            )

            units = min(
                remaining,
                slab_units
            )

        if units <= 0:
            continue

        charge += (
            units
            * rate
        )

        remaining -= units

        if limit is not None:
            previous_limit = limit

        if remaining <= 0:
            break

    return charge
# 7. FIXED CHARGE
def calculate_fixed_charge(
    fixed_charge
):
    """
    Fixed monthly electricity charge.
    """

    return max(
        float(fixed_charge),
        0
    )
# 8. OTHER CHARGES / TAXES
def calculate_percentage_charge(
    base_amount,
    percentage
):
    """
    Calculate a percentage-based applicable charge.

    Example:

        ₹2000 × 5% = ₹100

    The percentage is passed as:

        5

    rather than:

        0.05
    """

    if percentage < 0:
        raise ValueError(
            "Percentage cannot be negative."
        )

    return (
        base_amount
        * percentage
        / 100
    )
# 9. TOTAL ELECTRICITY BILL
def calculate_electricity_bill(
    grid_kwh,
    slabs,
    fixed_charge=0,
    percentage_charges=0,
    additional_charges=0,
    rebate=0
):
    """
    Calculate estimated electricity bill.

    Formula:

        Energy Charge
        + Fixed Charge
        + Applicable Percentage Charges
        + Additional Charges
        - Rebate

    NOTE:
    Actual Indian electricity bills vary by state,
    DISCOM, tariff category and tariff order.

    This function is intentionally generic.
    """

    energy_charge = calculate_slab_charge(
        grid_kwh,
        slabs
    )

    fixed = calculate_fixed_charge(
        fixed_charge
    )

    subtotal = (
        energy_charge
        + fixed
    )

    percentage_charge = calculate_percentage_charge(
        subtotal,
        percentage_charges
    )

    total_bill = (
        subtotal
        + percentage_charge
        + additional_charges
        - rebate
    )

    return max(
        total_bill,
        0
    )
# 10. CARBON EMISSION
def calculate_carbon_emission(
    grid_kwh,
    emission_factor=0.7
):
    """
    Estimate electricity-related carbon emissions.

    Formula:

        CO2e =
        Grid Electricity × Emission Factor

    emission_factor:
        kg CO2e / kWh

    Keep this configurable because emission factors
    can vary by methodology/grid/source.
    """

    if emission_factor < 0:
        raise ValueError(
            "Emission factor cannot be negative."
        )

    return (
        grid_kwh
        * emission_factor
    )
# 11. ENERGY PER PERSON
def energy_per_person(
    total_energy_kwh,
    household_size
):
    """
    Calculate monthly energy consumption per person.
    """

    if household_size <= 0:
        raise ValueError(
            "Household size must be greater than 0."
        )

    return (
        total_energy_kwh
        / household_size
    )
# 12. BILL PER PERSON
def bill_per_person(
    bill,
    household_size
):
    """
    Calculate estimated bill per household member.
    """

    if household_size <= 0:
        raise ValueError(
            "Household size must be greater than 0."
        )

    return (
        bill
        / household_size
    )
# 13. ENERGY SAVING SIMULATION
def calculate_usage_saving(
    power_watts,
    old_hours_per_day,
    new_hours_per_day,
    days_per_month=30
):
    """
    Calculate energy saved by reducing appliance usage.

    Example:

        Old: 6 hours/day
        New: 4 hours/day
    """

    old_energy = appliance_energy(
        power_watts,
        old_hours_per_day,
        days_per_month
    )

    new_energy = appliance_energy(
        power_watts,
        new_hours_per_day,
        days_per_month
    )

    saved_energy = (
        old_energy
        - new_energy
    )

    return max(
        saved_energy,
        0
    )
# 14. COST SAVING
def calculate_cost_saving(
    saved_kwh,
    average_rate
):
    """
    Estimate monetary saving.

    Formula:

        Saving = Saved kWh × ₹/kWh
    """

    return (
        saved_kwh
        * average_rate
    )
# 15. CARBON SAVING
def calculate_carbon_saving(
    saved_kwh,
    emission_factor=0.7
):
    """
    Estimate carbon reduction from saving electricity.
    """

    return (
        saved_kwh
        * emission_factor
    )
# 16. ENERGY INTENSITY
def energy_intensity_per_area(
    total_energy_kwh,
    home_area_sqft
):
    """
    Calculate monthly energy consumption per square foot.
    """

    if home_area_sqft <= 0:
        raise ValueError(
            "Home area must be greater than 0."
        )

    return (
        total_energy_kwh
        / home_area_sqft
    )
# 17. COMPLETE ENERGY ANALYSIS
def complete_energy_analysis(
    appliances,
    solar_kwh,
    household_size,
    home_area_sqft,
    slabs,
    fixed_charge=0,
    percentage_charges=0,
    additional_charges=0,
    rebate=0,
    emission_factor=0.7
):
    """
    Run the complete GreenPlus energy calculation.
    """

    # Total appliance consumption
    total_energy = total_appliance_energy(
        appliances
    )

    # Solar
    solar_percent = solar_contribution(
        solar_kwh,
        total_energy
    )

    # Grid
    grid_kwh = grid_energy(
        total_energy,
        solar_kwh
    )

    # Bill
    bill = calculate_electricity_bill(
        grid_kwh,
        slabs,
        fixed_charge,
        percentage_charges,
        additional_charges,
        rebate
    )

    # Carbon
    carbon = calculate_carbon_emission(
        grid_kwh,
        emission_factor
    )

    # Per person
    energy_person = energy_per_person(
        total_energy,
        household_size
    )

    bill_person = bill_per_person(
        bill,
        household_size
    )

    # Area intensity
    intensity = energy_intensity_per_area(
        total_energy,
        home_area_sqft
    )

    return {

        "total_energy_kwh":
            total_energy,

        "solar_kwh":
            solar_kwh,

        "solar_percentage":
            solar_percent,

        "grid_energy_kwh":
            grid_kwh,

        "estimated_bill":
            bill,

        "carbon_kg_co2e":
            carbon,

        "energy_per_person":
            energy_person,

        "bill_per_person":
            bill_person,

        "energy_intensity":
            intensity
    }
# END
