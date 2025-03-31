initial_inserts = [
    #Managers
    """
    INSERT OR IGNORE INTO manager (full_name,payroll_number,personnel_number,company_code)
    VALUES
    ('TEST', '0','0','0')
    """,
    #Item Groups
    """
    INSERT OR IGNORE INTO item_group (code, parent_code, hierarchy_level, description)
    VALUES 
    ('001', NULL, 1, 'MALLAS Y ALAMBRES'),
    ('012', NULL, 1, 'Industrial Filiales'),
    ('014', NULL, 1, 'CABLES'),
    ('0026', "001", 2, 'INDUSTRIAL NEGROS'),
    ('0027', "001", 2, 'INDUSTRIAL GALV.'),
    ('0029', "014", 2, 'CABLES QUERETARO'),
    ('0030', "014", 2, 'CABLES HOUSTON'),
    ('0036', "012", 2, 'Bajo Carbón'),
    ('0059', "012", 2, 'Alto Carbón'),
    ('0060', "012", 2, 'CHQ'),
    ('0063', "012", 2, 'Segunda/Excedentes')
    """,
]

