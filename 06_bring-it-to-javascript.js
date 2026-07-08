// ฟังก์ชันคำนวณราคารวมในตะกร้าสินค้า
const calculateTotal = (cartItems) => {
    return cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// ตัวอย่างข้อมูลสินค้าในตะกร้า
const myCart = [
    { id: 1, name: "Mechanical Keyboard", price: 2500, quantity: 1 },
    { id: 2, name: "Gaming Mouse", price: 1200, quantity: 2 }
];

const totalPrice = calculateTotal(myCart);
console.log(`ราคารวมทั้งหมดคือ: ${totalPrice} บาท`);