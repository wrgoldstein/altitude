from moz_sql_parser import parse, ParseException
from types import GeneratorType
import itertools as it

class Extractor:
    def __init__(self):
        self.froms = []

    def extract_tables(self, query):
        try:
            parsed = parse(query)
            self.parse_with(parsed['with']),
            self.parse_from(parsed['from'])
            return self.froms
        except ParseException:
            # Maybe in the future warn about this
            return []


    def parse_with(self, _with):
        if type(_with) == list:
            for inner in _with:
                self.parse_with(inner)
        elif 'from' in _with:
            self.parse_from(_with['from'])
        elif 'value' in _with:
            self.parse_with(_with['value'])

    def parse_from(self, rel):
        if type(rel) == list:
            for inner in rel:
                self.parse_from(inner)
        elif type(rel) == str:
            self.froms.append(rel)
        elif type(rel) == dict:
            for val in rel.values():
                self.parse_from(val)
