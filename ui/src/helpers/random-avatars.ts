export function randomAvatar() {
  const n = randomBoredApes.length;
  return randomBoredApes[Math.min(Math.random()*n)];
}

const randomBoredApes = [
  "https://img.seadn.io/files/8d625952a863680de6b255c9906d5bc3.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/07f4b348f4855a7cfe60d6a7b3a60225.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/c893d3fcac3dec581f1fc96894c8158e.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/8c3f8e7949c499bd630def761c07fbda.png?auto=format&fit=max&w=256",
]