ONES = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
]

TEENS = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
]

TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
]


def convert_hundred(number: int) -> str:
    result = []

    if number >= 100:
        result.append(ONES[number // 100])
        result.append("Hundred")

        number = number % 100

    if number >= 20:
        result.append(TENS[number // 10])

        if number % 10:
            result.append(ONES[number % 10])

    elif number >= 10:
        result.append(TEENS[number - 10])

    elif number > 0:
        result.append(ONES[number])

    return " ".join(result)


def number_to_words(number: int) -> str:

    if number == 0:
        return "Zero"

    if number < 0:
        return "Minus " + number_to_words(abs(number))

    parts = []

    crore = number // 10_000_000
    number = number % 10_000_000

    lakh = number // 100_000
    number = number % 100_000

    thousand = number // 1_000
    number = number % 1_000

    if crore:
        parts.append(convert_hundred(crore))
        parts.append("Crore")

    if lakh:
        parts.append(convert_hundred(lakh))
        parts.append("Lakh")

    if thousand:
        parts.append(convert_hundred(thousand))
        parts.append("Thousand")

    if number:
        parts.append(convert_hundred(number))

    return " ".join(parts)