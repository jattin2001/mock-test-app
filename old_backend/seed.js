// const Question = require("./models/Question");

// async function seed() {
//   await Question.deleteMany({});

//   await Question.insertMany([
//     {
//       question: "2 + 2 = ?",
//       options: ["2", "3", "4", "5"],
//       answer: 2,
//       subject: "Quant",
//       year: 2023,
//     },
//     {
//       question: "Capital of India?",
//       options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
//       answer: 0,
//       subject: "GK",
//       year: 2022,
//     },
//   ]);

//   console.log("Data added");
//   process.exit();
// }

// seed();
// const Question = require("../models/Question");

// async function seed() {
//   try {
//     await Question.deleteMany({});

//     await Question.insertMany([
//       {
//         question:
//           "Arrange the fractions 5/9, 4/7, 3/5 and, 2/3 in ascending order.",
//         options: [
//           "2/3, 4/7, 3/5, 5/9",
//           "5/9, 4/7, 3/5, 2/3",
//           "2/3, 3/4, 4/7, 5/9",
//           "4/7, 3/5, 5/9, 2/3",
//         ],
//         answer: 1, // Index 1 = Option 2
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question: "Simplify: (2½+ 3.6) - 1.9",
//         options: ["4.2", "5.2", "6.2", "7.2"],
//         answer: 0, // Index 0 = Option 1
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question: "Evaluate: 7¼ - [5/6 ÷ {1/3 - (1/2 × (3/4 - 1/4))}]",
//         options: ["-3 1/4", "3 1/4", "-2 3/4", "2 3/4"],
//         answer: 2, // Index 1 = Option 2
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "From a sample of 200 software engineers, determine the ratio of those proficient in Python to those proficient in Java using the given information: (Python and Java: 50, Python only: 70, Java only: 60, Neither: 20)",
//         options: ["11:12", "12:11", "7:6", "6:7"],
//         answer: 1, // Index 1 = Option 2
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "Arvind started a business by investing ₹80,000. After 4 months, Bhavin joined with ₹1,20,000. At the end of 8 months from the start, Chandan joined with ₹1,60,000. If the total profit is ₹1,05,000 at the end of the year, find the share of Chandan.",
//         options: ["26,500", "26,000", "26,200", "26,250"],
//         answer: 3, // Index 3 = Option 4
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A and B start a business. A invests ₹80,000 for 9 months, B invests ₹1,20,000 for 6 months. What is B's share of a ₹45,000 profit?",
//         options: ["26,500", "28,000", "36,000", "22,500"],
//         answer: 3, // Index 3 = Option 4
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "What is the average of all integers between 100 and 250 that are exactly divisible by 11?",
//         options: ["176", "186", "196", "146"],
//         answer: 0, // Index 0 = Option 1
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "The average of 15 numbers is 80. The average of the first 6 numbers is 72. The average of the next 6 numbers is 25% more than the average of the first 6 numbers. The 13th number is 8 more than the 15th number, and the 14th number is 10 less than the 15th number. What is the average of the 13th and 14th numbers?",
//         options: ["70.89", "85", "75.67", "80.65"],
//         answer: 2, // Index 2 = Option 3
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A landlord bought a flat for ₹8,00,000. He wants to earn a 9% annual return on his investment after paying ₹2,000 per month for maintenance. What should be the monthly rent he charges?",
//         options: ["₹7,000", "₹7,500", "₹8,000", "₹8,500"],
//         answer: 2, // Index 2 = Option 3
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "An amount is said to double in 5 years with compound interest. How many years will it take for the amount to grow to 8 times its original value?",
//         options: ["15", "16", "17", "18"],
//         answer: 0, // Index 0 = Option 1
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A sum becomes ₹6,600 in 2 years and ₹7,920 in 3 years at compound interest. What is the original principal?",
//         options: ["₹4,000.33", "₹5,583.33", "₹4,583.33", "₹6,583.33"],
//         answer: 2, // Index 2 = Option 3
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "Suman purchased 25 liters of milk at ₹45 per liter and another 15 liters of milk at ₹50 per liter. She combined both quantities and then sold the entire mixture at ₹48 per liter. What was her total profit or loss?",
//         options: [
//           "Loss of ₹45",
//           "Profit of ₹45",
//           "Profit of ₹90",
//           "Loss of ₹90",
//         ],
//         answer: 1, // Index 1 = Option 2
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A toy manufacturer produced 1200 toy cars at a total cost of ₹90,000. He donated 200 cars to a charity event. For the rest, he announced a 10% discount on the market price of ₹120 per car. He also offered 2 toy cars free for every 8 toy cars purchased. If all 1200 toy cars were distributed, what is his overall gain or loss percentage?",
//         options: ["4% loss", "4% profit", "5% loss", "5% profit"],
//         answer: 0, // Index 0 = Option 1
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A retailer marks an air conditioner 80% above its cost price. He offers a first discount of 25% on the marked price. During a festive offer, an additional discount of 10% is applied on the already discounted price. If the final selling price is ₹15,552, what is the approximate cost price of the air conditioner?",
//         options: ["₹9,000", "₹9,200", "₹12,800", "₹10,000"],
//         answer: 2, // Index 2 = Option 3
//         subject: "Quant",
//         year: 2025,
//       },
//       {
//         question:
//           "A 40-liter mixture contains juice and water in the ratio 5:3. How much water (in liters) must be added to this mixture to change the ratio of juice to water to 2:3?",
//         options: ["15.5 litres", "22.5 litres", "25 litres", "30 litres"],
//         answer: 1, // Index 1 = Option 2
//         subject: "Quant",
//         year: 2025,
//       },
//     ]);

//     console.log("Successfully added 15 questions to the database.");
//   } catch (error) {
//     console.error("Error seeding data:", error);
//   } finally {
//     process.exit();
//   }
// }

// seed();
