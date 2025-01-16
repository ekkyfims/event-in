import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { CreateEventDialog } from "./components/create-event-dialog";
import { EventDetailsDialog } from "./components/event-details-dialog";
import { ThemeToggle } from "./components/theme-toggle";

const API_URL = "http://localhost/event-in/api/api.php";

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEvents(
        data.map((event) => ({
          id: event.id,
          title: event.nama_event,
          time: `${event.waktu_mulai} - ${event.waktu_selesai} WIB`,
          type: event.berulang ? "berulang" : "sekali",
          description: event.deskripsi,
          date: event.tanggal,
          link_meet: event.link_meet,
        }))
      );
      setLoading(false);
    } catch (error) {
      toast.error("Gagal memuat events: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const handleEventUpdate = async (updatedEvent) => {
    try {
      const response = await fetch(`${API_URL}?id=${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_event: updatedEvent.nama_event,
          deskripsi: updatedEvent.deskripsi,
          tanggal: updatedEvent.tanggal,
          waktu_mulai: updatedEvent.waktu_mulai,
          waktu_selesai: updatedEvent.waktu_selesai,
          link_meet: updatedEvent.link_meet,
          berulang: updatedEvent.berulang,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setEvents(
        events.map((event) =>
          event.id === updatedEvent.id
            ? {
                id: updatedEvent.id,
                title: updatedEvent.nama_event,
                description: updatedEvent.deskripsi,
                date: updatedEvent.tanggal,
                time: `${updatedEvent.waktu_mulai} - ${updatedEvent.waktu_selesai} WIB`,
                type: updatedEvent.berulang ? "berulang" : "sekali",
                link_meet: updatedEvent.link_meet,
              }
            : event
        )
      );

      setSelectedEvent({
        id: updatedEvent.id,
        title: updatedEvent.nama_event,
        description: updatedEvent.deskripsi,
        date: updatedEvent.tanggal,
        time: `${updatedEvent.waktu_mulai} - ${updatedEvent.waktu_selesai} WIB`,
        type: updatedEvent.berulang ? "berulang" : "sekali",
        link_meet: updatedEvent.link_meet,
      });

      toast.success("Event berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui event: " + error.message);
    }
  };

  const handleCreateEvent = async (newEvent) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_event: newEvent.title,
          deskripsi: newEvent.description,
          tanggal: newEvent.date,
          waktu_mulai: newEvent.time.split(" - ")[0],
          waktu_selesai: newEvent.time.split(" - ")[1].replace(" WIB", ""),
          link_meet: newEvent.link_meet,
          berulang: newEvent.type === "berulang",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      await fetchEvents();
      setCreateDialogOpen(false);
      toast.success("Event berhasil dibuat");
    } catch (error) {
      toast.error("Gagal membuat event: " + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}?id=${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setEvents(events.filter((event) => event.id !== eventId));
      setDetailsDialogOpen(false);
      toast.success("Event berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus event: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                {formatDate(currentDate)}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Memuat events..."
                : `Anda memiliki ${events.length} event aktif`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Event
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className={cn(
                "p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]",
                event.type === "berulang"
                  ? "bg-gradient-to-r from-primary/10 to-background dark:from-primary/5 border-primary/20"
                  : "hover:border-primary"
              )}
              onClick={() => openEventDetails(event)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                </div>
                {event.link_meet && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(event.link_meet, "_blank");
                    }}
                  >
                    <Video className="h-4 w-4" />
                    Gabung Meet
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateEvent={handleCreateEvent}
      />
      <EventDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        event={selectedEvent}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default App;
