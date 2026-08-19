from tariff import *


print("\n")
print("       🌱 GREENPLUS TARIFF ENGINE")
# Test 1: 150 kWh
result = calculate_bill(
    consumption_kwh=150
)

print("\n")
print("150 kWh BILL")

print(
    f"Energy Charge : ₹{result['energy_charge']:.2f}"
)

print(
    f"Fixed Charge  : ₹{result['fixed_charge']:.2f}"
)

print(
    f"Other Charge  : ₹{result['percentage_charge']:.2f}"
)

print(
    f"Total Bill    : ₹{result['total_bill']:.2f}"
)
# Test 2: 350 kWh
result = calculate_bill(
    consumption_kwh=350
)

print("\n")
print("350 kWh BILL")

print(
    f"Energy Charge : ₹{result['energy_charge']:.2f}"
)

print(
    f"Fixed Charge  : ₹{result['fixed_charge']:.2f}"
)

print(
    f"Other Charge  : ₹{result['percentage_charge']:.2f}"
)

print(
    f"Total Bill    : ₹{result['total_bill']:.2f}"
)
# Test 3: Saving simulation
saving = compare_usage(
    old_consumption=500,
    new_consumption=400
)

print("\n")
print("       🌱 ENERGY SAVING SIMULATION")
print(
    f"\nOld Usage     : "
    f"{saving['old_consumption_kwh']} kWh"
)

print(
    f"New Usage     : "
    f"{saving['new_consumption_kwh']} kWh"
)

print(
    f"Energy Saved  : "
    f"{saving['energy_saved_kwh']:.2f} kWh"
)

print(
    f"Old Bill      : "
    f"₹{saving['old_bill']:.2f}"
)

print(
    f"New Bill      : "
    f"₹{saving['new_bill']:.2f}"
)

print(
    f"Money Saved   : "
    f"₹{saving['estimated_bill_saving']:.2f}"
)


print("\n")
print("      🌱 TARIFF ENGINE READY")
