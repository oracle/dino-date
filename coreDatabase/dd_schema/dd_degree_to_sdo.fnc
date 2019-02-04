CREATE OR REPLACE FUNCTION dd_degree_to_sdo (
  p_deglat   IN VARCHAR2,
  p_deglon   IN VARCHAR2)
  RETURN SDO_GEOMETRY
IS
  l_parts   DBMS_SQL.varchar2a;
  l_lon     NUMBER;
  l_lat     NUMBER;

  FUNCTION string_to_list (
    string_in IN VARCHAR2
  , delim_in IN VARCHAR2 := ','
  )
    RETURN DBMS_SQL.varchar2a
  IS
    l_item       VARCHAR2 (32767);
    l_loc        PLS_INTEGER;
    l_startloc   PLS_INTEGER        := 1;
    l_items      DBMS_SQL.varchar2a;
  BEGIN
    IF string_in IS NOT NULL
    THEN
       LOOP
          /* find next delimiter */
          l_loc := INSTR (string_in, delim_in, l_startloc);
          /* add the item */
          l_items (l_items.COUNT + 1) :=
             CASE l_loc
                /* two consecutive delimiters */
             WHEN l_startloc
                   THEN NULL
                /* rest of string is last item */
             WHEN 0
                   THEN SUBSTR (string_in, l_startloc)
                ELSE SUBSTR (string_in, l_startloc, l_loc - l_startloc)
             END;
  
          IF l_loc = 0
          THEN
             EXIT;
          ELSE
             l_startloc := l_loc + 1;
          END IF;
       END LOOP;
    END IF;
  
    RETURN l_items;
  END string_to_list;

  BEGIN
    l_parts := string_to_list (p_deglon, '-');

    IF l_parts (3) = 'W' OR l_parts (3) = 'E'
    THEN
      l_parts (4) := l_parts (3);
      l_parts (3) := '0';
    END IF;

    l_lon :=
    TO_NUMBER (l_parts (1))
    + (TO_NUMBER (l_parts (2)) / 60)
    + (TO_NUMBER (l_parts (3)) / 3600);

    IF l_parts (4) = 'W'
    THEN
      l_lon := - (l_lon);
    END IF;

    l_parts := string_to_list (p_deglat, '-');

    IF l_parts (3) = 'N' OR l_parts (3) = 'S'
    THEN
      l_parts (4) := l_parts (3);
      l_parts (3) := '0';
    END IF;

    l_lat :=
    TO_NUMBER (l_parts (1))
    + (TO_NUMBER (l_parts (2)) / 60)
    + (TO_NUMBER (l_parts (3)) / 3600);

    IF l_parts (4) = 'S'
    THEN
      l_lat := - (l_lat);
    END IF;

    RETURN sdo_geometry (2001,
                         4326,
                         sdo_point_type (l_lon, l_lat, NULL),
                         NULL,
                         NULL);
  END dd_degree_to_sdo;
/
