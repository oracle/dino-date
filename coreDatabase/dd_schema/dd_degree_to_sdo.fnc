CREATE OR REPLACE FUNCTION dd_degree_to_sdo (
  p_deglat   IN VARCHAR2,
  p_deglon   IN VARCHAR2)
  RETURN SDO_GEOMETRY
IS
  l_parts   apex_application_global.vc_arr2;
  l_lon     NUMBER;
  l_lat     NUMBER;
  BEGIN
    l_parts := APEX_UTIL.string_to_table (p_deglon, '-');

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

    l_parts := APEX_UTIL.string_to_table (p_deglat, '-');

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
