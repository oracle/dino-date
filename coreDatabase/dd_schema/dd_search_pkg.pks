/*-------------------------------------------------------------------------------
 *
 * Search Package
 */

CREATE OR REPLACE PACKAGE dd_search_pkg
AS
  TYPE SearchType IS RECORD (
      member_id NUMBER,
      dino_name VARCHAR2(400) );

  TYPE SearchTypeSet IS TABLE OF SearchType;

  FUNCTION text_only(
        member_id_p   IN INTEGER,
        search_string IN VARCHAR2)
      RETURN SearchTypeSet PIPELINED;

  FUNCTION text_and_spatial (
        member_id_p   IN INTEGER,
        search_string IN VARCHAR2,
        max_distance  IN INTEGER)
      RETURN SearchTypeSet PIPELINED;

END dd_search_pkg;
/