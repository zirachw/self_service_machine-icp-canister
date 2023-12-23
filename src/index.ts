import { Canister, query, text, update, Void, float64 } from 'azle';

// Global state variables
interface MachineState {
    availableItems: { name: string; price: number }[];
    currentOrder: { name: string; quantity: number }[];
    totalPayment: number;
    orderHistory: { items: string[]; total: number }[];
}

let state: MachineState = {
    availableItems: [
        { name: 'Burger', price: 5 },
        { name: 'Fries', price: 3 },
        { name: 'Drink', price: 2 },
    ],
    currentOrder: [],
    totalPayment: 0,
    orderHistory: [],
};

export default Canister({
    // Query calls

    getAvailableItems: query([], text, () => {
        return state.availableItems.map((item) => `${item.name} - $${item.price}`).join('\n');
    }),

    getCurrentOrder: query([], text, () => {
        return state.currentOrder.map((item) => `${item.name} x ${item.quantity}`).join('\n');
    }),

    getTotalPayment: query([], float64, () => {
        return state.totalPayment;
    }),

    getOrderHistory: query([], text, () => {
        return state.orderHistory.map((order) => `Items: ${order.items.join(', ')}, Total: $${order.total}`).join('\n');
    }),

    // Update calls

    addItemToOrder: update([text, float64], Void, (itemName: string, quantity: number) => {
        const item = state.availableItems.find((i) => i.name === itemName);
        if (item) {
            const existingItem = state.currentOrder.find((i) => i.name === itemName);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.currentOrder.push({ name: itemName, quantity: quantity });
            }
            state.totalPayment += item.price * quantity;
        }
    }),

    removeItemFromOrder: update([text], Void, (itemName: string) => {
        const index = state.currentOrder.findIndex((i) => i.name === itemName);
        if (index !== -1) {
            const item = state.currentOrder[index];
            const itemPrice = state.availableItems.find((i) => i.name === itemName)!.price;
            state.totalPayment -= itemPrice * item.quantity;
            state.currentOrder.splice(index, 1);
        }
    }),

    processPayment: update([], Void, () => {
        // ... actual payment processing (replace with integration to payment gateway)
        state.orderHistory.push({ items: state.currentOrder.map((i) => i.name), total: state.totalPayment });
        state.currentOrder = [];
        state.totalPayment = 0;
    }),
});
