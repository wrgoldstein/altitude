import psycopg2
import yaml
import pandas as pd

def connect():
    global cur
    global conn
    with open('config.yml') as f:
        conn = psycopg2.connect(**yaml.load(f))
        cur = conn.cursor()

def execute(sql):
    try:
        cur.execute(sql)
        columns = [d.name for d in cur.description]
        rows = cur.fetchall()
    except:
        conn.rollback()
        cur = conn.cursor()
        cur.execute(sql)
        columns = [d.name for d in cur.description]
        rows = cur.fetchall()
    return pd.DataFrame(rows, columns=columns)

connect()
