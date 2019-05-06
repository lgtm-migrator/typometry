qwerty = {
    'keys': [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    'leftOffsets': [0, 0, 0],
    'middleGap': [2, 2, 2]
}


def get_fingering(text: str, layout=qwerty):
    fingering = []
    for char in text.lower():
        if char == ' ':
            fingering.append(5)
            continue
        charRow = 0
        for row in layout['keys']:
            if char in row:
                break
            charRow += 1
        try:
            row = layout['keys'][charRow]
            leftOffset = layout['leftOffsets'][charRow]
            middleGap = layout['middleGap'][charRow]
        except IndexError:
            print('Unknown char ' + char + ' in "' + text + '"')
        rowIndex = row.index(char) + 1
        position = rowIndex - leftOffset
        if position <= 1:
            fingering.append(1)
        elif position <= 4:
            fingering.append(position)
        elif position == 5:
            fingering.append(4)
        else:  # right hand
            position += 2  # skip thumbs
            position -= middleGap
            if position <= 7:
                fingering.append(7)
            elif position <= 10:
                fingering.append(position)
            else:  # position beyond the right pinky
                fingering.append(10)
    return fingering
