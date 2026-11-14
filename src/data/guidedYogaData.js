import cobraGif from "../assets/fitness/cobra pose.gif";
import treeGif from "../assets/fitness/Tree Pose (Vrikshasana).gif";
import bowGif from "../assets/fitness/Bow Pose (Dhanurasana).gif";
import triangleGif from "../assets/fitness/Triangle Pose (Trikonasana).gif";
import warriorGif from "../assets/fitness/Warrior III (Virabhadrasana III).gif";
import extendedSideAngleGif from "../assets/fitness/Extended Side Angle Pose (Utthita Parsvakonasana).gif";
import suryaGif from "../assets/fitness/surya namaskar.gif";
import halfMoonGif from "../assets/fitness/Half Moon Pose (Ardha Chandrasana).gif";

import cobraStep1 from "../assets/fitness/Property 1=Cobra pose starting position-1 2.png";
import cobraStep2 from "../assets/fitness/Property 1=Cobra pose starting position-1 2 (1).png";
import cobraStep3 from "../assets/fitness/Property 1=Cobra pose starting position-1 2 (2).png";

import treeStep1 from "../assets/fitness/tree pose 1.png";
import treeStep2 from "../assets/fitness/tree pose 2.png";
import treeStep3 from "../assets/fitness/tree pose 3.png";

import bowStep1 from "../assets/fitness/Property 1=Prone bow pose starting position-1 1.png";
import bowStep2 from "../assets/fitness/Property 1=Bow pose ankle-grasp preparation-2 1.png";
import bowStep3 from "../assets/fitness/Property 1=Dhanurasana final bow pose-3 1.png";

import triangleStep1 from "../assets/fitness/Property 1=Extended Triangle Pose Starting Position-1 1.png";
import triangleStep2 from "../assets/fitness/Property 1=Intermediate triangle pose transition-2 1.png";
import triangleStep3 from "../assets/fitness/Property 1=Male athlete in extended triangle pose-3 1.png";

import warriorStep1 from "../assets/fitness/virabhadrasana 1.png";
import warriorStep2 from "../assets/fitness/virabhadrasana 2.png";
import warriorStep3 from "../assets/fitness/virabhadrasana 3.png";

import extendedStep1 from "../assets/fitness/utthita 1.png";
import extendedStep2 from "../assets/fitness/utthita 2.png";
import extendedStep3 from "../assets/fitness/utthita 3.png";

import suryaStep1 from "../assets/fitness/Property 1=SURYA 2 1.png";
import suryaStep2 from "../assets/fitness/Property 1=SURYA 5 1.png";
import suryaStep3 from "../assets/fitness/Property 1=SSURYA 6 1.png";
import suryaStep4 from "../assets/fitness/Property 1=SURYA 44 1.png";
import suryaStep5 from "../assets/fitness/Property 1=SURYA 7 1.png";
import suryaStep6 from "../assets/fitness/Property 1=SURYA 8 1.png";
import suryaStep7 from "../assets/fitness/Property 1=SURYA 10 1.png";
import suryaStep8 from "../assets/fitness/Property 1=SURYA 9 1.png";

export const GUIDED_YOGA_POSES = [
  {
    id: "cobra-pose",
    title: "Cobra Pose",
    sanskritName: "Bhujangasana",
    description: "Stretch your chest and engage your back",
    gif: cobraGif,
    steps: [
      { id: 1, title: "Lie flat", image: cobraStep1 },
      { id: 2, title: "Lift gently", image: cobraStep2 },
      { id: 3, title: "Hold the pose", image: cobraStep3 },
    ],
    benefits: [
      "Stretches the chest and abdomen.",
      "Engages the muscles of the back.",
      "Encourages gentle spinal extension.",
    ],
  },
  {
    id: "tree-pose",
    title: "Tree Pose",
    sanskritName: "Vrikshasana",
    description: "Find your balance and focus",
    gif: treeGif,
    steps: [
      { id: 1, title: "Stand tall", image: treeStep1 },
      { id: 2, title: "Rest your foot on your inner thigh.", image: treeStep2 },
      { id: 3, title: "Raise your arms and breathe.", image: treeStep3 },
    ],
    benefits: [
      "Practises balance and coordination.",
      "Engages the standing leg and core.",
    ],
  },
  {
    id: "bow-pose",
    title: "Bow Pose",
    sanskritName: "Dhanurasana",
    description: "Open your chest and stretch your thighs",
    gif: bowGif,
    steps: [
      { id: 1, title: "Lie flat", image: bowStep1 },
      { id: 2, title: "Hold your ankles", image: bowStep2 },
      { id: 3, title: "Lift gently", image: bowStep3 },
    ],
    benefits: [
      "Stretches the chest, abdomen, and thighs.",
      "Engages the back muscles.",
      "Encourages spinal flexibility.",
    ],
  },
  {
    id: "triangle-pose",
    title: "Triangle Pose",
    sanskritName: "Trikonasana",
    description: "Stretch your hips, legs, and sides",
    gif: triangleGif,
    steps: [
      { id: 1, title: "Stretch your arms sideways.", image: triangleStep1 },
      { id: 2, title: "Lean toward your front foot.", image: triangleStep2 },
      { id: 3, title: "Hand on shin, other arm up.", image: triangleStep3 },
    ],
    benefits: [
      "Stretches the legs, hips, and sides.",
      "Engages the legs and core.",
      "Practises balance and body awareness.",
    ],
  },
  {
    id: "warrior-three",
    title: "Warrior III",
    sanskritName: "Virabhadrasana III",
    description: "Challenge your balance and engage your core",
    gif: warriorGif,
    steps: [
      { id: 1, title: "Stand tall with palms together.", image: warriorStep1 },
      { id: 2, title: "Lean forward and lift one leg back.", image: warriorStep2 },
      { id: 3, title: "Reach forward, keeping hips level.", image: warriorStep3 },
    ],
    benefits: [
      "Engages the legs, glutes, and core.",
      "Practises balance and coordination.",
      "Encourages focus and body awareness.",
    ],
  },
  {
    id: "extended-side-angle",
    title: "Extended Side Angle",
    sanskritName: "Utthita Parsvakonasana",
    description: "Stretch your sides and engage your legs",
    gif: extendedSideAngleGif,
    steps: [
      { id: 1, title: "Step wide, bend knee, arms out.", image: extendedStep1 },
      { id: 2, title: "Rest front forearm on thigh.", image: extendedStep2 },
      { id: 3, title: "Extend your top arm past your ear.", image: extendedStep3 },
    ],
    benefits: [
      "Strengthens the legs and ankles.",
      "Stretches the sides of the body.",
      "Encourages steady breathing and body awareness.",
    ],
  },
  {
    id: "surya-namaskar",
    title: "Surya Namaskar",
    sanskritName: "Sun Salutation",
    description: "Connect movement and breathing through a guided sequence",
    gif: suryaGif,
    layout: "sequence",
    steps: [
      { id: 1, title: "Stand with palms together", image: suryaStep1 },
      { id: 2, title: "Fold and step back", image: suryaStep2 },
      { id: 3, title: "Move into plank", image: suryaStep3 },
      { id: 4, title: "Lower knees, chest, chin", image: suryaStep4 },
      { id: 5, title: "Lift into cobra", image: suryaStep5 },
      { id: 6, title: "Raise hips into downward dog", image: suryaStep6 },
      { id: 7, title: "Step forward into a lunge", image: suryaStep7 },
      { id: 8, title: "Return to standing", image: suryaStep8 },
    ],
    benefits: [
      "Stretches and engages multiple muscle groups.",
      "Practises coordination and body awareness.",
      "Connects movement with steady breathing.",
    ],
  },
  {
    id: "half-moon-pose",
    title: "Half Moon Pose",
    sanskritName: "Ardha Chandrasana",
    description: "Practise balance and open your hips",
    gif: halfMoonGif,
    steps: [
      { id: 1, title: "Lean sideways, hand on shin", image: halfMoonGif },
      { id: 2, title: "Lower your hand and lift one leg", image: halfMoonGif },
      { id: 3, title: "Open your chest and raise your arm", image: halfMoonGif },
    ],
    benefits: [
      "Engages the legs, glutes, and core.",
      "Practises balance and coordination.",
      "Encourages focus and body awareness.",
    ],
  },
];

export function getGuidedYogaPose(poseId) {
  return GUIDED_YOGA_POSES.find((pose) => pose.id === poseId) || null;
}
