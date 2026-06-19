questions = [
    "Compute Spearman’s rank correlation coefficient from the following data:\nX: 40,42,45,35,36,39 \nY: 46,43,44,39,40,43",
    "Fit a line y on x to the following data \n X: 0,1,2,3,4 \n Y: 1,1.8,3.3,4.5,6.3",
    "A continuous random variable has probability density function: f(x)=k(x- x^2), 0≤x≤1. Find (i) mean, (ii) variance.",
    "Earn A contains 2 black and 1 white balls; earn B contains 1 black and 2 white balls; earn C contains 2 black and 2 white balls. One of the urns is selected at random and 1 ball is drawn. What is the probability of drawing a white ball from earn B?",
    "Find the Fourier expansion of f(x)=xcosx, −π<x<π."
]

options = [
    ["0.7714", "0.7614", "0", "0.78"],
    ["a = 0.47, b = 1.3","a = 0.72, b = 1.33","a = 0.73, b = 1.2","a = 0.44, b = 1.22"],
    ["E(x)=0.5 and Var(x)=0.5","E(x)=0.05 and Var(x)=0.3","E(x)=0.3 and Var(x)=0.05","E(x)=0.5 and Var(x)=0.05"],
    ["1/9","1/3","4/9","2/9"],
    ["(a_{0})=0, (a_{n})=0, (b_{n})=(frac{-2pi n}{n^{2}-1})",
     "(a_{0})=(frac{-2pi n}{n^{2}-1}), (a_{n})=0, (b_{n})=0)",
     "(a_{0})=(frac{-4pi n}{n^{2}-1}), (a_{n})=0, (b_{n})=(frac{-2pi n}{n^{2}-1})",
     "(a_{0})=(frac{-2 pi n}{n^{2}-1}), (a_{n})=(frac{-4 pi n}{n^{2}-1}), (b_{n})=0"]
]

answers = [0, 1, 3, 2, 0]  # Corrected: flat list of correct answer indices for each question

def quiz():
    score = 0
    for idx, question in enumerate(questions):
        print(f"\nQuestion {idx+1}: {question}")
        for opt_num, opt in enumerate(options[idx]):
            print(f"  {chr(65+opt_num)}. {opt}")
        ans = input("Your answer (A/B/C/D): ").strip().upper()
        if ans in 'ABCD':
            if ord(ans) - 65 == answers[idx]:
                print("Correct!")
                score += 1
            else:
                print(f"Incorrect! Correct answer is {chr(65 + answers[idx])}.")
        else:
            print("Invalid input, skipping question.")
    print(f"\nQuiz complete! \n You scored {score}/{len(questions)}.")

if __name__ == "__main__":
    quiz()
