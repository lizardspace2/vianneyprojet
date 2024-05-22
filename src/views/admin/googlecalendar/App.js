import React, { useState, useContext, useEffect } from "react";
import { getMonth } from "./util";
import { ChakraProvider, Flex, Box, Text, VStack, Tooltip, Grid } from "@chakra-ui/react";
import CalendarHeader from "./components/CalendarHeader";
import Sidebar from "./components/Sidebar";
import GlobalContext from "./context/GlobalContext";
import EventModal from "./components/EventModal";
import dayjs from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
import 'dayjs/locale/fr';
import CreateEventButton from "./components/CreateEventButton";
import ModifyAction from "./components/ModifyAction";
import ModifyActionButtonBis from "./components/ModifyActionButtonBis";
import ActionIdDisplay from "./components/ActionIdDisplay"; // Import the ActionIdDisplay component
import { createClient } from '@supabase/supabase-js';

dayjs.locale('fr');
dayjs.extend(isBetween);
const supabaseUrl = 'https://pvpsmyizvorwwccuwbuq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cHNteWl6dm9yd3djY3V3YnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjgzMDg2MCwiZXhwIjoyMDE4NDA2ODYwfQ.9YDEN41__xBFJU91XY9e3r119A03yQ2oq5azmrx1aqY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY');
}

const formatTooltipContent = (event) => {
  return (
    <VStack align="left" spacing={1}>
      <Text>Intervenant: {event.nom || 'N/A'} {event.prenom || 'N/A'}</Text>
      <Text>Disponible pour: {event.action_name}</Text>
      <Text>Du: {formatDate(event.starting_date)} au {formatDate(event.ending_date)}</Text>
      <Text>Commentaire: {event.action_comment || 'N/A'}</Text>
      <Text>Dernière mise à jour: {formatDate(event.last_updated)}</Text>
    </VStack>
  );
};

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal } = useContext(GlobalContext); // Add selectedEvent state
  // eslint-disable-next-line
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [selectedActionData, setSelectedActionData] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null); // Renamed for clarity
  const { setDaySelected, setShowEventModal, setSelectedEvent } = useContext(GlobalContext);
  // eslint-disable-next-line
  const [isModifyActionModalOpen, setModifyActionModalOpen] = useState(false);
  const modifyActionButtonStyle = {
    display: 'none', // This style will hide the button
  };
  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);
  useEffect(() => {
    if (selectedAction) {
      setSelectedActionData(selectedAction); // Set the selected action data for ModifyActionButton
      setModifyActionModalOpen(true); // Open the modal
    }
  }, [selectedAction]);


  const DayComponent = ({ day, rowIdx, setSelectedAction }) => {
    const [dayEvents, setDayEvents] = useState([]);

    useEffect(() => {
      const fetchActions = async () => {
        const { data, error } = await supabase
          .from('team_action_view_rendering')
          .select('*');

        if (error) {
          console.error('Error fetching actions:', error);
        } else {
          const events = data.filter(action =>
            dayjs(day).isBetween(dayjs(action.starting_date).subtract(1, 'day'), dayjs(action.ending_date), null, '[]')
          );
          setDayEvents(events);
        }
      };

      fetchActions();
    }, [day]);

    function getCurrentDayClass() {
      return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
        ? { bg: "blue.600", color: "white", borderRadius: "full", w: "7" }
        : {};
    }

    return (
      <Box border="1px" borderColor="gray.200" flexDir="column" display="flex">
        <Flex flexDir="column" alignItems="center">
          {rowIdx === 0 && (
            <Text fontSize="sm" mt={1}>
              {day.format("ddd").toUpperCase()}
            </Text>
          )}
          <Text
            fontSize="sm"
            p={1}
            my={1}
            textAlign="center"
            {...getCurrentDayClass()}
          >
            {day.format("DD")}
          </Text>
        </Flex>
        <Flex
          flexDir="column"
          flex={1}
          cursor="pointer"
          onClick={() => {
            setDaySelected(day);
            setShowEventModal(true);
          }}
        >
          {dayEvents.map((event, idx) => (
            <Tooltip
              key={idx}
              label={formatTooltipContent(event)}
              fontSize="sm"
              placement="right"
              hasArrow
            >
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  setDaySelected(day);
                  setSelectedEvent(event.id);
                  setSelectedAction(event);
                }}
                bg={event.color || 'gray.200'}
                p={1}
                color="gray.600"
                fontSize="sm"
                borderRadius="md"
                mb={1}
                width="100%"
                isTruncated
              >
                {event.action_name}
              </Box>
            </Tooltip>
          ))}
        </Flex>
      </Box>
    );
  };

  return (
    <ChakraProvider>
      {showEventModal && !showModifyForm && <EventModal />}
      <Flex direction="column" height="100vh">
        <CalendarHeader />

        <Flex
          className="main-container"
          flex={1}
          direction={["column", "row"]}
        >
          <Box
            className="sidebar"
            width={["full", "350px"]}
          >
            <Flex alignItems="center">
              <CreateEventButton />
              <div style={modifyActionButtonStyle}>
              <ModifyAction initialActionData={selectedActionData} />
              </div>
              <ModifyActionButtonBis />
              <ActionIdDisplay actionId={selectedActionData?.action_id} /> {/* Pass the action_id property */}
            </Flex>
            <Box display={["none", "block"]}>
              <Sidebar />
            </Box>
          </Box>
          <Grid flex="1" templateColumns="repeat(7, 1fr)" templateRows="repeat(5, 1fr)" p={1}>
            {currentMonth.map((row, i) => (
              <React.Fragment key={i}>
                {row.map((day, idx) => (
                  <DayComponent
                    day={day}
                    rowIdx={i}
                    key={idx}
                    setSelectedAction={setSelectedAction} // Add this line
                  />
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
