qwerty = {
    'layers': [
        {
            'modifierName': None,
            'modifierFinger': None,
            'keys': [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
            ],
        },
        {
            'modifierName': 'Shift',
            'modifierFinger': 1,
            'keys': [
                ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
                ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
            ],
        }
    ],
    'leftOffsets': [0, 0, 0, 0],
    'middleGap': [2, 2, 2, 2]
}


def get_fingering(text: str, layout=qwerty):
    fingering = []
    lastMod = None
    modGroup = None
    for char in text:
        if char == ' ':
            if lastMod is not None:
                fingering.append(modGroup)
                modGroup = None
                lastMod = None
            fingering.append((' ', 5))
            continue
        charLayer = 0
        found = False
        for layer in layout['layers']:
            charRow = 0
            for row in layer['keys']:
                if char in row:
                    found = True
                    break
                charRow += 1
            if found:
                break
            charLayer += 1
        try:
            row = layout['layers'][charLayer]['keys'][charRow]
            modifier = layout['layers'][charLayer]['modifierName']
            modifierFinger = layout['layers'][charLayer]['modifierFinger']
            if modifier != lastMod and modGroup is not None:
                fingering.append(modGroup)
                modGroup = None
            if modifier is not None and lastMod is None:
                modGroup = {
                    'modName': modifier,
                    'modFinger': modifierFinger,
                    'fingering': []
                }
            leftOffset = layout['leftOffsets'][charRow]
            middleGap = layout['middleGap'][charRow]
        except IndexError:
            print('Unknown char ' + char + ' in "' + text + '"')
            fingering.append((char, None))
            continue
        rowIndex = row.index(char) + 1
        position = rowIndex - leftOffset
        if position <= 1:
            if modifierFinger == 1:
                fingering.append((char, 2))
            else:
                fingering.append((char, 1))
        elif position <= 4:
            fingering.append((char, position))
        elif position == 5:
            fingering.append((char, 4))
        else:  # right hand
            position += 2  # skip thumbs
            position -= middleGap
            if position <= 7:
                fingering.append((char, 7))
            elif position <= 10:
                fingering.append((char, position))
            else:  # position beyond the right pinky
                if modifierFinger == 10:
                    fingering.append((char, 9))
                else:
                    fingering.append((char, 10))
        if modifier is not None:
            modGroup['fingering'].append(fingering.pop())
            lastMod = modifier
        else:
            lastMod = None

    if modGroup is not None:
        fingering.append(modGroup)

    fingerSet = set()
    for item in fingering:
        if isinstance(item, dict):
            fingerSet.add(item['modFinger'])
            for char, finger in item['fingering']:
                fingerSet.add(finger)
        else:
            test = ('one', 'two')
            fingerSet.add(item[1])

    return {
        'fingering': fingering,
        'fingerSet': list(fingerSet)
    }