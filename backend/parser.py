#A parser for the CC-Cedict. Convert the Chinese-English dictionary into a list of python dictionaries with "traditional","simplified", "pinyin", and "english" keys.

#Make sure that the cedict_ts.u8 file is in the same folder as this file, and that the name matches the file name on line 13.

#Before starting, open the CEDICT text file and delete the copyright information at the top. Otherwise the program will try to parse it and you will get an error message.

#Characters that are commonly used as surnames have two entries in CC-CEDICT. This program will remove the surname entry if there is another entry for the character. If you want to include the surnames, simply delete lines 59 and 60.

# Portions of this code was written by Franki Allegra in February 2020. Modified by Jonathan Huang 2026

def load_dictionary():
    """Load and parse the CC-Cedict dictionary file."""
    with open('cedict_ts.u8', encoding='utf-8') as file:
        text = file.read()
        lines = text.split('\n')
        dict_lines = list(lines)

    list_of_dicts = []

    def parse_line(line):
        parsed = {}

        if line == '':
            return 0

        line = line.rstrip('/')
        line = line.split('/')

        if len(line) <= 1:
            return 0

        definition = [d.lower() for d in line[1:4]]

        char_and_pinyin = line[0].split('[')
        characters = char_and_pinyin[0].split()

        if len(characters) < 2:
          return

        traditional = characters[0]
        simplified = characters[1]

        pinyin = char_and_pinyin[1]
        pinyin = pinyin.rstrip().rstrip("]").lower()

        parsed['traditional'] = traditional
        parsed['simplified'] = simplified
        parsed['pinyin'] = pinyin
        parsed['definition'] = definition

        list_of_dicts.append(parsed)

    def remove_surnames():
      nonlocal list_of_dicts

      filtered_entries = []

      for entry in list_of_dicts:
        entry["definition"] = [
          defi
          for defi in entry["definition"]
          if "surname" not in defi.lower()
        ]

        if len(entry["definition"]) > 0:
          filtered_entries.append(entry)
      
      list_of_dicts = filtered_entries

    # Parse each line into a dictionary
    print("Parsing dictionary . . .")
    for line in dict_lines:
        parse_line(line)

    # Remove entries for surnames from the data (optional)
    print("Removing Surnames . . .")
    remove_surnames()

    print('Done!')
    return list_of_dicts