"""
GREENPLUS TARIFF ENGINE 🇮🇳

Purpose:
    Calculate electricity charges using tariff parameters.

Architecture:

    Location
       ↓
    State / City
       ↓
    DISCOM
       ↓
    Consumer Category
       ↓
    Tariff Configuration
       ↓
    Slab Calculation
       ↓
    Electricity Bill

IMPORTANT:
The tariff values below are DEMONSTRATION values only.
They are NOT official current tariffs for any Indian
state or DISCOM.

Later we will replace the configuration with verified
official tariff schedules.
"""
# 1. DEMONSTRATION TARIFF CONFIGURATION
DEMO_TARIFFS = {

    "demo_residential": {

        "state": "Demo State",

        "discom": "Demo DISCOM",

        "category": "residential",

        "currency": "INR",

        # Monthly fixed charge
        "fixed_charge": 150,

        # Demonstration slab structure
        #
        # limit = upper consumption limit
        # rate  = ₹ / kWh
        #
        "slabs": [

            {
                "limit": 100,
                "rate": 3.00
            },

            {
                "limit": 200,
                "rate": 5.00
            },

            {
                "limit": 300,
                "rate": 7.00
            },

            {
                "limit": None,
                "rate": 8.50
            }
        ],

        # Generic demonstration percentage charge.
        #
        # DO NOT interpret this as a universal GST
        # or Indian electricity tax.
        #
        "percentage_charge": 5.0,

        # Additional charge
        "additional_charge": 0,

        # Rebate
        "rebate": 0,

        # Date metadata
        "effective_from": "DEMO",

        "source": "DEMONSTRATION ONLY"
    }
}
# 2. GET TARIFF
def get_tariff(tariff_id="demo_residential"):
    """
    Return tariff configuration.

    Later this function can receive:

        state
        city
        discom
        category

    and automatically select the correct tariff.
    """

    if tariff_id not in DEMO_TARIFFS:

        raise ValueError(
            f"Tariff '{tariff_id}' was not found."
        )

    return DEMO_TARIFFS[tariff_id]
# 3. GET SLABS
def get_slabs(tariff_id="demo_residential"):

    tariff = get_tariff(tariff_id)

    return tariff["slabs"]
# 4. GET FIXED CHARGE
def get_fixed_charge(tariff_id="demo_residential"):

    tariff = get_tariff(tariff_id)

    return tariff["fixed_charge"]
# 5. GET PERCENTAGE CHARGE
def get_percentage_charge(
    tariff_id="demo_residential"
):

    tariff = get_tariff(tariff_id)

    return tariff["percentage_charge"]
# 6. SLAB ENERGY CHARGE
def calculate_energy_charge(
    consumption_kwh,
    tariff_id="demo_residential"
):
    """
    Calculate progressive slab-based energy charge.

    Example demonstration:

        0 - 100 kWh     → ₹3
        101 - 200 kWh   → ₹5
        201 - 300 kWh   → ₹7
        >300 kWh        → ₹8.5
    """

    if consumption_kwh < 0:

        raise ValueError(
            "Consumption cannot be negative."
        )

    slabs = get_slabs(tariff_id)

    remaining = consumption_kwh

    previous_limit = 0

    total_charge = 0.0

    for slab in slabs:

        limit = slab["limit"]

        rate = slab["rate"]

        # Unlimited final slab
        if limit is None:

            units = remaining

        else:

            slab_capacity = (
                limit
                - previous_limit
            )

            units = min(
                remaining,
                slab_capacity
            )

        if units > 0:

            total_charge += (
                units * rate
            )

            remaining -= units

        if limit is not None:

            previous_limit = limit

        if remaining <= 0:

            break

    return total_charge
# 7. FIXED CHARGE
def calculate_fixed_charge(
    tariff_id="demo_residential"
):

    return get_fixed_charge(
        tariff_id
    )
# 8. PERCENTAGE CHARGE
def calculate_percentage_charge(
    base_amount,
    tariff_id="demo_residential"
):
    """
    Calculate the configured percentage-based charge.

    IMPORTANT:
    This is a generic calculation mechanism.
    It should not be labeled as GST unless the applicable
    tariff/regulatory source explicitly requires GST.
    """

    percentage = get_percentage_charge(
        tariff_id
    )

    return (
        base_amount
        * percentage
        / 100
    )
# 9. TOTAL BILL
def calculate_bill(
    consumption_kwh,
    tariff_id="demo_residential"
):
    """
    Calculate complete estimated bill.

    Formula:

        Energy Charge
        + Fixed Charge
        + Percentage Charge
        + Additional Charge
        - Rebate
    """

    tariff = get_tariff(
        tariff_id
    )
    # Energy charge
    energy_charge = calculate_energy_charge(
        consumption_kwh,
        tariff_id
    )
    # Fixed charge
    fixed_charge = tariff[
        "fixed_charge"
    ]
    # Subtotal
    subtotal = (
        energy_charge
        + fixed_charge
    )
    # Percentage charge
    percentage_charge = (
        calculate_percentage_charge(
            subtotal,
            tariff_id
        )
    )
    # Additional charges
    additional_charge = tariff[
        "additional_charge"
    ]
    # Rebate
    rebate = tariff[
        "rebate"
    ]
    # Final bill
    total = (
        subtotal
        + percentage_charge
        + additional_charge
        - rebate
    )

    return {
        "consumption_kwh":
            consumption_kwh,

        "energy_charge":
            energy_charge,

        "fixed_charge":
            fixed_charge,

        "percentage_charge":
            percentage_charge,

        "additional_charge":
            additional_charge,

        "rebate":
            rebate,

        "total_bill":
            max(total, 0),

        "tariff_id":
            tariff_id,

        "state":
            tariff["state"],

        "discom":
            tariff["discom"],

        "category":
            tariff["category"],

        "effective_from":
            tariff["effective_from"],

        "source":
            tariff["source"]
    }
# 10. AVERAGE COST PER kWh
def average_cost_per_kwh(
    total_bill,
    consumption_kwh
):
    """
    Calculate effective average cost per kWh.

        Total Bill / Total Consumption
    """

    if consumption_kwh <= 0:

        return 0.0

    return (
        total_bill
        / consumption_kwh
    )
# 11. COMPARE ENERGY USAGE
def compare_usage(
    old_consumption,
    new_consumption,
    tariff_id="demo_residential"
):
    """
    Compare two monthly electricity consumption levels.

    Useful for GreenPlus recommendations.

    Example:

        Current = 500 kWh
        Target  = 400 kWh

    The function calculates potential bill savings.
    """

    old_bill = calculate_bill(
        old_consumption,
        tariff_id
    )

    new_bill = calculate_bill(
        new_consumption,
        tariff_id
    )

    bill_saving = (
        old_bill["total_bill"]
        - new_bill["total_bill"]
    )

    energy_saving = (
        old_consumption
        - new_consumption
    )

    old_average = average_cost_per_kwh(
        old_bill["total_bill"],
        old_consumption
    )

    new_average = average_cost_per_kwh(
        new_bill["total_bill"],
        new_consumption
    )

    return {

        "old_consumption_kwh":
            old_consumption,

        "new_consumption_kwh":
            new_consumption,

        "energy_saved_kwh":
            max(energy_saving, 0),

        "old_bill":
            old_bill["total_bill"],

        "new_bill":
            new_bill["total_bill"],

        "estimated_bill_saving":
            max(bill_saving, 0),

        "old_average_cost_per_kwh":
            old_average,

        "new_average_cost_per_kwh":
            new_average
    }
# 12. TARIFF INFORMATION
def tariff_information(
    tariff_id="demo_residential"
):
    """
    Return human-readable tariff information.
    """

    tariff = get_tariff(
        tariff_id
    )

    return {

        "state":
            tariff["state"],

        "discom":
            tariff["discom"],

        "category":
            tariff["category"],

        "fixed_charge":
            tariff["fixed_charge"],

        "slabs":
            tariff["slabs"],

        "percentage_charge":
            tariff["percentage_charge"],

        "effective_from":
            tariff["effective_from"],

        "source":
            tariff["source"]
    }
# END OF TARIFF ENGINE
