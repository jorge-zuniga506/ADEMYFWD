export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Category: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      Course: {
        Row: {
          categoryId: string
          descripcion: string
          duracionHoras: number | null
          esExclusivoFwd: boolean
          estado: Database["public"]["Enums"]["CourseStatus"]
          id: string
          instructorId: string
          liveMeetFecha: string | null
          liveMeetLink: string | null
          precio: number
          titulo: string
          videoUrl: string | null
        }
        Insert: {
          categoryId: string
          descripcion: string
          duracionHoras?: number | null
          esExclusivoFwd?: boolean
          estado?: Database["public"]["Enums"]["CourseStatus"]
          id?: string
          instructorId: string
          liveMeetFecha?: string | null
          liveMeetLink?: string | null
          precio?: number
          titulo: string
          videoUrl?: string | null
        }
        Update: {
          categoryId?: string
          descripcion?: string
          duracionHoras?: number | null
          esExclusivoFwd?: boolean
          estado?: Database["public"]["Enums"]["CourseStatus"]
          id?: string
          instructorId?: string
          liveMeetFecha?: string | null
          liveMeetLink?: string | null
          precio?: number
          titulo?: string
          videoUrl?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Course_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Course_instructorId_fkey"
            columns: ["instructorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CourseReview: {
        Row: {
          comentario: string | null
          courseId: string
          estrellas: number
          id: string
          userId: string
        }
        Insert: {
          comentario?: string | null
          courseId: string
          estrellas: number
          id?: string
          userId: string
        }
        Update: {
          comentario?: string | null
          courseId?: string
          estrellas?: number
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CourseReview_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CourseReview_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Enrollment: {
        Row: {
          archivado: boolean | null
          completado: boolean
          courseId: string
          fechaCompletado: string | null
          id: string
          lastLessonId: string | null
          progreso: number
          userId: string
        }
        Insert: {
          archivado?: boolean | null
          completado?: boolean
          courseId: string
          fechaCompletado?: string | null
          id?: string
          lastLessonId?: string | null
          progreso?: number
          userId: string
        }
        Update: {
          archivado?: boolean | null
          completado?: boolean
          courseId?: string
          fechaCompletado?: string | null
          id?: string
          lastLessonId?: string | null
          progreso?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Enrollment_lastLessonId_fkey"
            columns: ["lastLessonId"]
            isOneToOne: false
            referencedRelation: "Lesson"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Enrollment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FwdCodeSnippet: {
        Row: {
          codigoTexto: string
          fechaCreacion: string
          id: string
          titulo: string
          userId: string
        }
        Insert: {
          codigoTexto: string
          fechaCreacion?: string
          id?: string
          titulo: string
          userId: string
        }
        Update: {
          codigoTexto?: string
          fechaCreacion?: string
          id?: string
          titulo?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FwdCodeSnippet_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FwdCredential: {
        Row: {
          documentoUrl: string
          estado: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud: string
          id: string
          notasAdmin: string | null
          userId: string
        }
        Insert: {
          documentoUrl: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud?: string
          id?: string
          notasAdmin?: string | null
          userId: string
        }
        Update: {
          documentoUrl?: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud?: string
          id?: string
          notasAdmin?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FwdCredential_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FwdJobPost: {
        Row: {
          descripcion: string
          empresa: string
          estado: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion: string
          id: string
          salario: string | null
          tituloPuesto: string
          usuarioId: string | null
        }
        Insert: {
          descripcion: string
          empresa: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion?: string
          id?: string
          salario?: string | null
          tituloPuesto: string
          usuarioId?: string | null
        }
        Update: {
          descripcion?: string
          empresa?: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion?: string
          id?: string
          salario?: string | null
          tituloPuesto?: string
          usuarioId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FwdJobPost_usuarioId_fkey"
            columns: ["usuarioId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      InstructorVerification: {
        Row: {
          analisisIA: Json | null
          certificadoUrl: string
          comentario: string | null
          createdAt: string | null
          estado: Database["public"]["Enums"]["VerificacionEstado"] | null
          id: string
          puntuacion: number | null
          revisadoEn: string | null
          userId: string
        }
        Insert: {
          analisisIA?: Json | null
          certificadoUrl: string
          comentario?: string | null
          createdAt?: string | null
          estado?: Database["public"]["Enums"]["VerificacionEstado"] | null
          id?: string
          puntuacion?: number | null
          revisadoEn?: string | null
          userId: string
        }
        Update: {
          analisisIA?: Json | null
          certificadoUrl?: string
          comentario?: string | null
          createdAt?: string | null
          estado?: Database["public"]["Enums"]["VerificacionEstado"] | null
          id?: string
          puntuacion?: number | null
          revisadoEn?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "InstructorVerification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Lesson: {
        Row: {
          esGratis: boolean
          id: string
          orden: number
          recursoNombre: string | null
          recursoUrl: string | null
          sectionId: string
          titulo: string
          videoUrl: string
        }
        Insert: {
          esGratis?: boolean
          id?: string
          orden: number
          recursoNombre?: string | null
          recursoUrl?: string | null
          sectionId: string
          titulo: string
          videoUrl: string
        }
        Update: {
          esGratis?: boolean
          id?: string
          orden?: number
          recursoNombre?: string | null
          recursoUrl?: string | null
          sectionId?: string
          titulo?: string
          videoUrl?: string
        }
        Relationships: [
          {
            foreignKeyName: "Lesson_sectionId_fkey"
            columns: ["sectionId"]
            isOneToOne: false
            referencedRelation: "Section"
            referencedColumns: ["id"]
          },
        ]
      }
      Membership: {
        Row: {
          activa: boolean | null
          beneficios: Json | null
          createdAt: string | null
          descripcion: string | null
          descuentoPorcentaje: number | null
          id: string
          nombre: string
          precio: number
          tipo: Database["public"]["Enums"]["MembershipTipo"]
        }
        Insert: {
          activa?: boolean | null
          beneficios?: Json | null
          createdAt?: string | null
          descripcion?: string | null
          descuentoPorcentaje?: number | null
          id?: string
          nombre: string
          precio: number
          tipo: Database["public"]["Enums"]["MembershipTipo"]
        }
        Update: {
          activa?: boolean | null
          beneficios?: Json | null
          createdAt?: string | null
          descripcion?: string | null
          descuentoPorcentaje?: number | null
          id?: string
          nombre?: string
          precio?: number
          tipo?: Database["public"]["Enums"]["MembershipTipo"]
        }
        Relationships: []
      }
      PayoutRequest: {
        Row: {
          cantidad: number
          cuenta: string
          estado: string
          fechaSolicitud: string
          id: string
          metodo: string
          userId: string
        }
        Insert: {
          cantidad: number
          cuenta: string
          estado?: string
          fechaSolicitud?: string
          id?: string
          metodo: string
          userId: string
        }
        Update: {
          cantidad?: number
          cuenta?: string
          estado?: string
          fechaSolicitud?: string
          id?: string
          metodo?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "PayoutRequest_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Question: {
        Row: {
          contenido: string
          courseid: string
          fechacreacion: string
          id: string
          resuelta: boolean
          titulo: string
          userid: string
          videoSegundo: number | null
        }
        Insert: {
          contenido: string
          courseid: string
          fechacreacion?: string
          id?: string
          resuelta?: boolean
          titulo: string
          userid: string
          videoSegundo?: number | null
        }
        Update: {
          contenido?: string
          courseid?: string
          fechacreacion?: string
          id?: string
          resuelta?: boolean
          titulo?: string
          userid?: string
          videoSegundo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Question_courseid_fkey"
            columns: ["courseid"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Question_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Respuesta: {
        Row: {
          contenido: string
          fechacreacion: string
          id: string
          questionid: string
          userid: string
        }
        Insert: {
          contenido: string
          fechacreacion?: string
          id?: string
          questionid: string
          userid: string
        }
        Update: {
          contenido?: string
          fechacreacion?: string
          id?: string
          questionid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "Respuesta_questionid_fkey"
            columns: ["questionid"]
            isOneToOne: false
            referencedRelation: "Question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Respuesta_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Section: {
        Row: {
          courseId: string
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          courseId: string
          id?: string
          orden: number
          titulo: string
        }
        Update: {
          courseId?: string
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "Section_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Transaction: {
        Row: {
          cantidad: number
          courseId: string
          fecha: string
          id: string
          userId: string
        }
        Insert: {
          cantidad: number
          courseId: string
          fecha?: string
          id?: string
          userId: string
        }
        Update: {
          cantidad?: number
          courseId?: string
          fecha?: string
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transaction_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Transaction_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          avatarUrl: string | null
          bio: string | null
          comoNosConocio: string | null
          email: string
          fechaRegistro: string
          fotourl: string | null
          id: string
          isVerified: boolean | null
          nombre: string
          onboardingDone: boolean
          passwordHash: string
          propositoUso: string | null
          redessociales: Json | null
          rol: Database["public"]["Enums"]["Role"]
          username: string | null
        }
        Insert: {
          avatarUrl?: string | null
          bio?: string | null
          comoNosConocio?: string | null
          email: string
          fechaRegistro?: string
          fotourl?: string | null
          id?: string
          isVerified?: boolean | null
          nombre: string
          onboardingDone?: boolean
          passwordHash: string
          propositoUso?: string | null
          redessociales?: Json | null
          rol?: Database["public"]["Enums"]["Role"]
          username?: string | null
        }
        Update: {
          avatarUrl?: string | null
          bio?: string | null
          comoNosConocio?: string | null
          email?: string
          fechaRegistro?: string
          fotourl?: string | null
          id?: string
          isVerified?: boolean | null
          nombre?: string
          onboardingDone?: boolean
          passwordHash?: string
          propositoUso?: string | null
          redessociales?: Json | null
          rol?: Database["public"]["Enums"]["Role"]
          username?: string | null
        }
        Relationships: []
      }
      UserMembership: {
        Row: {
          createdAt: string | null
          estado: Database["public"]["Enums"]["MembershipEstado"] | null
          fechaFin: string | null
          fechaInicio: string | null
          id: string
          membershipId: string
          montoPagado: number
          stripeCustomerId: string | null
          stripeSessionId: string | null
          stripeSubscriptionId: string | null
          userId: string
        }
        Insert: {
          createdAt?: string | null
          estado?: Database["public"]["Enums"]["MembershipEstado"] | null
          fechaFin?: string | null
          fechaInicio?: string | null
          id?: string
          membershipId: string
          montoPagado: number
          stripeCustomerId?: string | null
          stripeSessionId?: string | null
          stripeSubscriptionId?: string | null
          userId: string
        }
        Update: {
          createdAt?: string | null
          estado?: Database["public"]["Enums"]["MembershipEstado"] | null
          fechaFin?: string | null
          fechaInicio?: string | null
          id?: string
          membershipId?: string
          montoPagado?: number
          stripeCustomerId?: string | null
          stripeSessionId?: string | null
          stripeSubscriptionId?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserMembership_membershipId_fkey"
            columns: ["membershipId"]
            isOneToOne: false
            referencedRelation: "Membership"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserMembership_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
      es_instructor: { Args: never; Returns: boolean }
    }
    Enums: {
      CourseStatus: "BORRADOR" | "EN_REVISION" | "PUBLICADO"
      MembershipEstado: "ACTIVA" | "VENCIDA" | "CANCELADA" | "PENDIENTE_PAGO"
      MembershipTipo: "DESCUENTO" | "ESTANDAR" | "PRO_MAX"
      Role: "ESTUDIANTE" | "INSTRUCTOR" | "GRADUADO_FWD" | "ADMIN"
      VerificacionEstado: "PENDIENTE" | "APROBADO" | "RECHAZADO"
      VerificationStatus: "PENDIENTE" | "APROBADA" | "RECHAZADA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CourseStatus: ["BORRADOR", "EN_REVISION", "PUBLICADO"],
      MembershipEstado: ["ACTIVA", "VENCIDA", "CANCELADA", "PENDIENTE_PAGO"],
      MembershipTipo: ["DESCUENTO", "ESTANDAR", "PRO_MAX"],
      Role: ["ESTUDIANTE", "INSTRUCTOR", "GRADUADO_FWD", "ADMIN"],
      VerificacionEstado: ["PENDIENTE", "APROBADO", "RECHAZADO"],
      VerificationStatus: ["PENDIENTE", "APROBADA", "RECHAZADA"],
    },
  },
} as const
